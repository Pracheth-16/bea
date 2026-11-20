export const ROLES = {
  EMPLOYEE: 'employee',
  AGENT: 'agent',
  SUPERVISOR: 'supervisor',
  ADMIN: 'admin'
};

export const CATEGORIES = {
  HARDWARE: 'hardware',
  SOFTWARE: 'software',
  NETWORK: 'network',
  NEW_ASSET: 'new_asset'
};

export const PRIORITIES = {
  LOW: 'low',
  ROUTINE: 'routine',
  URGENT: 'urgent',
  CRITICAL: 'critical'
};

export const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  ESCALATED: 'escalated'
};

export const ASSET_STATUS = {
  IN_STOCK: 'in_stock',
  ASSIGNED: 'assigned',
  UNDER_MAINTENANCE: 'under_maintenance',
  RETIRED: 'retired'
};

export const ASSET_REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  FULFILLED: 'fulfilled'
};

// SLA Policies in hours: resolution deadline
export const SLA_THRESHOLDS = {
  [PRIORITIES.CRITICAL]: 4,   // 4 hours (e.g. server outage, exam hall network)
  [PRIORITIES.URGENT]: 12,    // 12 hours (e.g. faculty workstation down)
  [PRIORITIES.ROUTINE]: 48,   // 48 hours (e.g. standard software request)
  [PRIORITIES.LOW]: 72        // 72 hours (e.g. general enquiry)
};

// Auto-routing configuration: maps ticket category to department name
export const ROUTING_RULES = {
  [CATEGORIES.HARDWARE]: 'IT Hardware & Facilities',
  [CATEGORIES.SOFTWARE]: 'Enterprise Software Support',
  [CATEGORIES.NETWORK]: 'Campus Network & Infrastructure',
  [CATEGORIES.NEW_ASSET]: 'IT Assets & Procurement'
};

