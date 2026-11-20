import { slaEngine } from '../services/slaEngine.js';
import { classifyTicketWithAI } from '../services/aiService.js';
import { store } from '../services/dataStore.js';

export const evaluateSLA = (req, res) => {
  const result = slaEngine.evaluateAllTickets();
  res.json({
    success: true,
    message: 'SLA Engine evaluated active tickets successfully.',
    metrics: result
  });
};

export const aiClassify = async (req, res) => {
  const { title, description } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required for AI classification.' });
  }

  const analysis = await classifyTicketWithAI(title, description || '');
  res.json({ success: true, analysis });
};

export const getAuditLogs = (req, res) => {
  const logs = store.getCollection('auditLogs');
  const sorted = [...logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json({ logs: sorted.slice(0, 100) });
};

export const resetDemoData = (req, res) => {
  store.resetToDefaults();
  slaEngine.evaluateAllTickets();
  res.json({ success: true, message: 'All ITSM records reset to default BMSIT demo state.' });
};

