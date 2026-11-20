import { store } from '../services/dataStore.js';
import { routeTicket } from '../services/routingService.js';
import { slaEngine } from '../services/slaEngine.js';
import { notificationService } from '../services/notificationService.js';
import { SLA_THRESHOLDS, PRIORITIES, TICKET_STATUS, ROLES } from '../config/constants.js';

export const getTickets = (req, res) => {
  const { role, id: userId, department } = req.user;
  const { status, priority, category, search } = req.query;

  let tickets = store.getCollection('tickets');

  // Role-based visibility
  if (role === ROLES.EMPLOYEE) {
    tickets = tickets.filter((t) => t.createdById === userId);
  } else if (role === ROLES.AGENT) {
    // Agents see tickets assigned to them OR tickets in their department queue
    tickets = tickets.filter(
      (t) => t.assignedAgentId === userId || t.department === department || t.createdById === userId
    );
  }
  // Supervisors and Admins see all tickets across the institution

  // Query filters
  if (status) {
    tickets = tickets.filter((t) => t.status === status);
  }
  if (priority) {
    tickets = tickets.filter((t) => t.priority === priority);
  }
  if (category) {
    tickets = tickets.filter((t) => t.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    tickets = tickets.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.ticketNumber.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }

  // FR-6 Priority Queue Ordering:
  // 1. Critical priority & Escalated tickets ALWAYS at the top!
  // 2. Urgent tickets
  // 3. Routine tickets
  // 4. Low tickets
  const priorityWeight = {
    [PRIORITIES.CRITICAL]: 4,
    [PRIORITIES.URGENT]: 3,
    [PRIORITIES.ROUTINE]: 2,
    [PRIORITIES.LOW]: 1
  };

  const sorted = [...tickets].sort((a, b) => {
    // Escalated tickets get super-priority
    const aEsc = a.isEscalated ? 10 : 0;
    const bEsc = b.isEscalated ? 10 : 0;
    const scoreA = (priorityWeight[a.priority] || 1) + aEsc;
    const scoreB = (priorityWeight[b.priority] || 1) + bEsc;
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }
    // Newer first if equal priority
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  res.json({ tickets: sorted, total: sorted.length });
};

export const getTicketById = (req, res) => {
  const { id } = req.params;
  const ticket = store.findById('tickets', id);

  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found.' });
  }

  // Access check
  if (
    req.user.role === ROLES.EMPLOYEE &&
    ticket.createdById !== req.user.id
  ) {
    return res.status(403).json({ error: 'Access denied to this ticket.' });
  }

  res.json({ ticket });
};

export const createTicket = (req, res) => {
  const { title, description, category, priority = PRIORITIES.ROUTINE, relatedAssetId } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({ error: 'Title, description, and category are required.' });
  }

  // Auto-Routing (FR-2)
  const routing = routeTicket(category);

  // SLA Calculation (FR-3)
  const slaHours = SLA_THRESHOLDS[priority] || SLA_THRESHOLDS[PRIORITIES.ROUTINE];
  const createdAt = new Date().toISOString();
  const slaDeadline = slaEngine.calculateDeadline(createdAt, priority);

  // Associated Asset info
  let relatedAssetTag = null;
  if (relatedAssetId) {
    const asset = store.findById('assets', relatedAssetId);
    if (asset) {
      relatedAssetTag = asset.assetTag;
    }
  }

  const allTickets = store.getCollection('tickets');
  const count = allTickets.length + 1;
  const ticketNumber = `TKT-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;

  const isCritical = priority === PRIORITIES.CRITICAL;

  const newTicket = store.create('tickets', {
    ticketNumber,
    title,
    description,
    category,
    priority,
    status: isCritical ? TICKET_STATUS.OPEN : TICKET_STATUS.OPEN,
    department: routing.department,
    assignedAgentId: routing.assignedAgentId,
    assignedAgentName: routing.assignedAgentName,
    createdById: req.user.id,
    createdByName: req.user.name,
    createdByEmail: req.user.email,
    relatedAssetId: relatedAssetId || null,
    relatedAssetTag,
    slaHours,
    createdAt,
    slaDeadline,
    isBreached: false,
    isWarning: false,
    isEscalated: false,
    escalatedAt: null,
    escalatedToSupervisor: false,
    resolutionNotes: '',
    history: [
      {
        action: `Ticket Raised by ${req.user.name} (${req.user.role})`,
        by: req.user.name,
        timestamp: createdAt
      },
      {
        action: `Auto-routed to department '${routing.department}' per FR-2 category routing`,
        by: 'System SLA & Routing Engine',
        timestamp: createdAt
      },
      {
        action: routing.assignedAgentId
          ? `Auto-assigned to agent ${routing.assignedAgentName} (Least-loaded algorithm)`
          : `Placed in unassigned queue for department ${routing.department}`,
        by: 'System SLA & Routing Engine',
        timestamp: createdAt
      }
    ]
  });

  store.logAudit('TICKET_CREATED', req.user.id, req.user.name, `Created ticket ${ticketNumber} [${priority.toUpperCase()}]`);

  // Notification to assigned agent (FR-7)
  if (routing.assignedAgentId) {
    notificationService.notify({
      userId: routing.assignedAgentId,
      type: 'ticket_assigned',
      title: `New Ticket Assigned: ${ticketNumber}`,
      message: `${req.user.name} raised ticket "${title}" under ${routing.department}`,
      ticketId: newTicket.id
    });
  }

  // If Critical priority, immediately alert supervisor (FR-6)
  if (isCritical) {
    const supervisor = store.findOne('users', { role: ROLES.SUPERVISOR });
    if (supervisor) {
      notificationService.notify({
        userId: supervisor.id,
        type: 'sla_warning',
        title: `🚨 CRITICAL Ticket Created: ${ticketNumber}`,
        message: `A Critical priority ticket was opened: "${title}". SLA is 4 hours.`,
        ticketId: newTicket.id
      });
    }
  }

  res.status(201).json({ success: true, ticket: newTicket });
};

export const updateTicketStatus = (req, res) => {
  const { id } = req.params;
  const { status, resolutionNotes } = req.body;

  const ticket = store.findById('tickets', id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found.' });
  }

  const updates = {};
  const historyEntry = {
    by: req.user.name,
    timestamp: new Date().toISOString()
  };

  if (status) {
    updates.status = status;
    historyEntry.action = `Status transitioned from '${ticket.status}' to '${status}'`;

    if (status === TICKET_STATUS.RESOLVED || status === TICKET_STATUS.CLOSED) {
      updates.resolvedAt = new Date().toISOString();
      if (resolutionNotes) {
        updates.resolutionNotes = resolutionNotes;
      }
      historyEntry.action += `. Resolution notes: "${resolutionNotes || 'Resolved as per standard IT procedure'}"`;
    }
  }

  if (resolutionNotes && !status) {
    updates.resolutionNotes = resolutionNotes;
    historyEntry.action = `Added resolution notes: "${resolutionNotes}"`;
  }

  if (!ticket.history) ticket.history = [];
  ticket.history.push(historyEntry);
  updates.history = ticket.history;

  const updatedTicket = store.updateById('tickets', id, updates);

  store.logAudit(
    'TICKET_UPDATED',
    req.user.id,
    req.user.name,
    `Updated ticket ${ticket.ticketNumber} to status '${status || ticket.status}'`
  );

  // Notify employee of ticket update (FR-7)
  notificationService.notify({
    userId: ticket.createdById,
    type: 'ticket_update',
    title: `Ticket ${ticket.ticketNumber} Status: ${status ? status.toUpperCase() : 'Updated'}`,
    message: `${req.user.name} updated your ticket. Resolution remarks: ${resolutionNotes || 'None'}`,
    ticketId: ticket.id
  });

  res.json({ success: true, ticket: updatedTicket });
};

export const reassignTicket = (req, res) => {
  const { id } = req.params;
  const { agentId } = req.body;

  const ticket = store.findById('tickets', id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found.' });
  }

  const targetAgent = store.findById('users', agentId);
  if (!targetAgent) {
    return res.status(404).json({ error: 'Target agent not found.' });
  }

  if (!ticket.history) ticket.history = [];
  ticket.history.push({
    action: `Reassigned from '${ticket.assignedAgentName}' to '${targetAgent.name}' by ${req.user.name}`,
    by: req.user.name,
    timestamp: new Date().toISOString()
  });

  const updated = store.updateById('tickets', id, {
    assignedAgentId: targetAgent.id,
    assignedAgentName: targetAgent.name,
    history: ticket.history
  });

  notificationService.notify({
    userId: targetAgent.id,
    type: 'ticket_assigned',
    title: `Ticket Reassigned to You: ${ticket.ticketNumber}`,
    message: `${req.user.name} reassigned "${ticket.title}" to you.`,
    ticketId: ticket.id
  });

  res.json({ success: true, ticket: updated });
};

export const escalateTicket = (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const ticket = store.findById('tickets', id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found.' });
  }

  const supervisor = store.findOne('users', { role: ROLES.SUPERVISOR });

  if (!ticket.history) ticket.history = [];
  ticket.history.push({
    action: `Manual Escalation Triggered by ${req.user.name}. Reason: ${reason || 'Immediate supervisor assistance required'}`,
    by: req.user.name,
    timestamp: new Date().toISOString()
  });

  const updated = store.updateById('tickets', id, {
    status: TICKET_STATUS.ESCALATED,
    isEscalated: true,
    escalatedAt: new Date().toISOString(),
    escalatedToSupervisor: true,
    assignedAgentId: supervisor ? supervisor.id : ticket.assignedAgentId,
    assignedAgentName: supervisor ? `${supervisor.name} (Supervisor)` : ticket.assignedAgentName,
    history: ticket.history
  });

  if (supervisor) {
    notificationService.notify({
      userId: supervisor.id,
      type: 'sla_escalation',
      title: `🚨 Escalation Override: ${ticket.ticketNumber}`,
      message: `${req.user.name} escalated ticket "${ticket.title}". Reason: ${reason || 'Priority override'}`,
      ticketId: ticket.id
    });
  }

  res.json({ success: true, ticket: updated });
};

