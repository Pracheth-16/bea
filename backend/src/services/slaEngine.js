import { store } from './dataStore.js';
import { SLA_THRESHOLDS, PRIORITIES, TICKET_STATUS } from '../config/constants.js';

class SLAEngine {
  constructor() {
    this.intervalId = null;
  }

  start(intervalMs = 30000) {
    console.log(`[SLA Engine] Started background evaluation runner (interval: ${intervalMs}ms)`);
    // Run an immediate evaluation on boot
    this.evaluateAllTickets();
    this.intervalId = setInterval(() => {
      this.evaluateAllTickets();
    }, intervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[SLA Engine] Background evaluation stopped.');
    }
  }

  /**
   * Calculates deadline given ticket creation timestamp and priority
   */
  calculateDeadline(createdAt, priority) {
    const hours = SLA_THRESHOLDS[priority] || SLA_THRESHOLDS[PRIORITIES.ROUTINE];
    const createdTime = new Date(createdAt).getTime();
    return new Date(createdTime + hours * 3600 * 1000).toISOString();
  }

  /**
   * Evaluates all active tickets and flags warnings, breaches, and auto-escalations.
   * Meets NFR-2: evaluation finishes in milliseconds.
   */
  evaluateAllTickets() {
    const startTime = Date.now();
    const tickets = store.getCollection('tickets');
    const now = Date.now();
    let updatedCount = 0;
    let breachCount = 0;
    let escalationCount = 0;

    const supervisor = store.findOne('users', { role: 'supervisor' });

    tickets.forEach((ticket) => {
      // Skip resolved or closed tickets
      if (ticket.status === TICKET_STATUS.RESOLVED || ticket.status === TICKET_STATUS.CLOSED) {
        return;
      }

      const createdTime = new Date(ticket.createdAt).getTime();
      const deadlineTime = new Date(ticket.slaDeadline).getTime();
      const totalAllowedMs = (ticket.slaHours || 48) * 3600 * 1000;
      const elapsedMs = now - createdTime;
      const percentElapsed = Math.min(100, Math.round((elapsedMs / totalAllowedMs) * 100));

      let needsSave = false;
      const updates = {};

      // 1. Check SLA 75% Warning (FR-3, FR-7)
      if (percentElapsed >= 75 && !ticket.isWarning && !ticket.isBreached) {
        updates.isWarning = true;
        needsSave = true;
        const msg = `Ticket ${ticket.ticketNumber} has reached 75% of its SLA threshold (${ticket.slaHours}h)`;
        this.addTicketHistory(ticket, 'SLA 75% Warning Threshold Reached', 'SLA Engine');
        this.sendNotification(
          ticket.assignedAgentId || supervisor?.id,
          'sla_warning',
          `⚠️ SLA Warning: ${ticket.ticketNumber}`,
          msg,
          ticket.id
        );
      }

      // 2. Check SLA 100% Breach (FR-3, FR-6)
      if (now > deadlineTime && !ticket.isBreached) {
        updates.isBreached = true;
        breachCount++;
        needsSave = true;
        const breachMsg = `Ticket ${ticket.ticketNumber} BREACHED its SLA limit of ${ticket.slaHours}h`;
        this.addTicketHistory(ticket, 'SLA BREACH DETECTED', 'SLA Engine');
        store.logAudit('SLA_BREACH', 'system', 'SLA Engine', breachMsg);

        // Notify Agent and Supervisor
        if (ticket.assignedAgentId) {
          this.sendNotification(
            ticket.assignedAgentId,
            'sla_breach',
            `🚨 SLA Breached: ${ticket.ticketNumber}`,
            `Your assigned ticket ${ticket.ticketNumber} has breached SLA deadline.`,
            ticket.id
          );
        }

        // FR-6: Auto-Escalation for Critical tickets or any breached ticket
        if (!ticket.isEscalated) {
          updates.isEscalated = true;
          updates.escalatedAt = new Date().toISOString();
          updates.escalatedToSupervisor = true;
          updates.status = TICKET_STATUS.ESCALATED;
          if (supervisor) {
            updates.assignedAgentId = supervisor.id;
            updates.assignedAgentName = `${supervisor.name} (Supervisor)`;
          }
          escalationCount++;
          this.addTicketHistory(
            ticket,
            `AUTO-ESCALATED TO SUPERVISOR per FR-6 priority queue policy`,
            'SLA Escalation Engine'
          );
          if (supervisor) {
            this.sendNotification(
              supervisor.id,
              'sla_escalation',
              `🚨 CRITICAL Escalation: ${ticket.ticketNumber}`,
              `Ticket ${ticket.ticketNumber} (${ticket.title}) was auto-escalated to you due to SLA breach.`,
              ticket.id
            );
          }
        }
      }

      if (needsSave) {
        Object.assign(ticket, updates);
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      store.save();
    }

    const durationMs = Date.now() - startTime;
    return {
      durationMs,
      evaluated: tickets.length,
      updated: updatedCount,
      newBreaches: breachCount,
      newEscalations: escalationCount
    };
  }

  addTicketHistory(ticket, action, by) {
    if (!ticket.history) ticket.history = [];
    ticket.history.push({
      action,
      by,
      timestamp: new Date().toISOString()
    });
  }

  sendNotification(userId, type, title, message, ticketId) {
    if (!userId) return;
    store.create('notifications', {
      userId,
      type,
      title,
      message,
      ticketId,
      read: false
    });
  }
}

export const slaEngine = new SLAEngine();

