import { store } from './dataStore.js';
import { ROUTING_RULES, CATEGORIES, ROLES, TICKET_STATUS } from '../config/constants.js';

export const routeTicket = (category) => {
  const targetDeptName = ROUTING_RULES[category] || 'IT Hardware & Facilities';
  const allUsers = store.getCollection('users');
  const allTickets = store.getCollection('tickets');

  // Find department agents
  let candidates = allUsers.filter(
    (u) => (u.role === ROLES.AGENT || u.role === ROLES.SUPERVISOR) && u.department === targetDeptName
  );

  // If no specific agent in that exact department, fallback to any available agent
  if (candidates.length === 0) {
    candidates = allUsers.filter((u) => u.role === ROLES.AGENT);
  }

  // If still none, fallback to supervisor or admin
  if (candidates.length === 0) {
    candidates = allUsers.filter((u) => u.role === ROLES.SUPERVISOR || u.role === ROLES.ADMIN);
  }

  if (candidates.length === 0) {
    return {
      department: targetDeptName,
      assignedAgentId: null,
      assignedAgentName: 'Unassigned Queue'
    };
  }

  // Workload-balanced assignment: find agent with least active (open/in_progress) tickets
  let selectedAgent = candidates[0];
  let minWorkload = Infinity;

  candidates.forEach((agent) => {
    const activeCount = allTickets.filter(
      (t) =>
        t.assignedAgentId === agent.id &&
        (t.status === TICKET_STATUS.OPEN || t.status === TICKET_STATUS.IN_PROGRESS)
    ).length;

    if (activeCount < minWorkload) {
      minWorkload = activeCount;
      selectedAgent = agent;
    }
  });

  return {
    department: targetDeptName,
    assignedAgentId: selectedAgent.id,
    assignedAgentName: selectedAgent.name
  };
};

