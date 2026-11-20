import { store } from '../services/dataStore.js';
import { TICKET_STATUS, ASSET_STATUS } from '../config/constants.js';

export const getDashboardMetrics = (req, res) => {
  const tickets = store.getCollection('tickets');
  const assets = store.getCollection('assets');
  const departments = store.getCollection('departments');
  const assetRequests = store.getCollection('assetRequests');

  // 1. Ticket Volumes
  const totalTickets = tickets.length;
  const openCount = tickets.filter((t) => t.status === TICKET_STATUS.OPEN).length;
  const inProgressCount = tickets.filter((t) => t.status === TICKET_STATUS.IN_PROGRESS).length;
  const resolvedCount = tickets.filter((t) => t.status === TICKET_STATUS.RESOLVED || t.status === TICKET_STATUS.CLOSED).length;
  const escalatedCount = tickets.filter((t) => t.isEscalated || t.status === TICKET_STATUS.ESCALATED).length;
  const breachedCount = tickets.filter((t) => t.isBreached).length;

  // SLA Compliance Rate
  const nonBreachedCount = totalTickets - breachedCount;
  const slaComplianceRate = totalTickets > 0 ? Number(((nonBreachedCount / totalTickets) * 100).toFixed(1)) : 100;

  // Mean Time to Resolution (MTTR) in hours
  const resolvedTickets = tickets.filter((t) => t.resolvedAt);
  let totalResolutionHours = 0;
  resolvedTickets.forEach((t) => {
    const start = new Date(t.createdAt).getTime();
    const end = new Date(t.resolvedAt).getTime();
    const diffHours = (end - start) / (3600 * 1000);
    totalResolutionHours += Math.max(0, diffHours);
  });
  const mttrHours = resolvedTickets.length > 0 ? Number((totalResolutionHours / resolvedTickets.length).toFixed(1)) : 0;

  // Tickets by Department
  const ticketsByDept = {};
  departments.forEach((d) => {
    ticketsByDept[d.name] = 0;
  });
  tickets.forEach((t) => {
    ticketsByDept[t.department] = (ticketsByDept[t.department] || 0) + 1;
  });

  // Tickets by Category
  const ticketsByCategory = {
    hardware: tickets.filter((t) => t.category === 'hardware').length,
    software: tickets.filter((t) => t.category === 'software').length,
    network: tickets.filter((t) => t.category === 'network').length,
    new_asset: tickets.filter((t) => t.category === 'new_asset').length
  };

  // Tickets by Priority
  const ticketsByPriority = {
    critical: tickets.filter((t) => t.priority === 'critical').length,
    urgent: tickets.filter((t) => t.priority === 'urgent').length,
    routine: tickets.filter((t) => t.priority === 'routine').length,
    low: tickets.filter((t) => t.priority === 'low').length
  };

  // 2. Asset Utilization Statistics
  const totalAssets = assets.length;
  const inStockAssets = assets.filter((a) => a.status === ASSET_STATUS.IN_STOCK).length;
  const assignedAssets = assets.filter((a) => a.status === ASSET_STATUS.ASSIGNED).length;
  const maintenanceAssets = assets.filter((a) => a.status === ASSET_STATUS.UNDER_MAINTENANCE).length;
  const retiredAssets = assets.filter((a) => a.status === ASSET_STATUS.RETIRED).length;

  const assetUtilizationRate = totalAssets > 0 ? Number(((assignedAssets / totalAssets) * 100).toFixed(1)) : 0;

  // Assets by Category
  const assetsByCategory = {};
  assets.forEach((a) => {
    assetsByCategory[a.category] = (assetsByCategory[a.category] || 0) + 1;
  });

  // Assets with upcoming warranty expiry (within next 180 days)
  const now = Date.now();
  const warningWindow = 180 * 86400 * 1000;
  const upcomingWarrantyExpiries = assets.filter((a) => {
    const expiry = new Date(a.warrantyExpiryDate).getTime();
    return expiry > now && expiry - now <= warningWindow;
  }).length;

  // 3. Pending Asset Requests
  const pendingRequests = assetRequests.filter((r) => r.status === 'pending').length;

  res.json({
    kpis: {
      totalTickets,
      openCount,
      inProgressCount,
      resolvedCount,
      escalatedCount,
      breachedCount,
      slaComplianceRate,
      mttrHours,
      totalAssets,
      assignedAssets,
      inStockAssets,
      maintenanceAssets,
      assetUtilizationRate,
      upcomingWarrantyExpiries,
      pendingRequests
    },
    distributions: {
      ticketsByDept,
      ticketsByCategory,
      ticketsByPriority,
      assetsByCategory
    }
  });
};

export const exportReportCSV = (req, res) => {
  const tickets = store.getCollection('tickets');

  const headers = [
    'Ticket ID',
    'Ticket Number',
    'Title',
    'Category',
    'Priority',
    'Status',
    'Department',
    'Created By',
    'Assigned Agent',
    'SLA Hours',
    'Created At',
    'SLA Deadline',
    'Is Breached',
    'Is Escalated'
  ];

  const rows = tickets.map((t) => [
    `"${t.id}"`,
    `"${t.ticketNumber}"`,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    `"${t.category}"`,
    `"${t.priority}"`,
    `"${t.status}"`,
    `"${t.department}"`,
    `"${t.createdByName}"`,
    `"${t.assignedAgentName || 'Unassigned'}"`,
    t.slaHours,
    `"${t.createdAt}"`,
    `"${t.slaDeadline}"`,
    t.isBreached ? 'YES' : 'NO',
    t.isEscalated ? 'YES' : 'NO'
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="ITSM_Tickets_Report_${Date.now()}.csv"`);
  res.send(csvContent);
};

