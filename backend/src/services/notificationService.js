import { store } from './dataStore.js';

class NotificationService {
  constructor() {
    this.simulatedDispatchLog = [];
  }

  notify({ userId, type, title, message, ticketId = null, requestId = null }) {
    const notif = store.create('notifications', {
      userId,
      type,
      title,
      message,
      ticketId,
      requestId,
      read: false
    });

    // Also record simulated external email/SMS dispatch per FR-7
    const dispatchEntry = {
      id: `disp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      channel: 'EMAIL/SMS_SIMULATED',
      recipientId: userId,
      subject: title,
      body: message,
      status: 'DELIVERED'
    };
    this.simulatedDispatchLog.unshift(dispatchEntry);
    if (this.simulatedDispatchLog.length > 50) {
      this.simulatedDispatchLog.pop();
    }

    // Trigger n8n webhook async if configured
    this.dispatchN8nWebhook({
      event: type,
      timestamp: new Date().toISOString(),
      data: { userId, title, message, ticketId, requestId }
    });

    return notif;
  }

  async dispatchN8nWebhook(payload) {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      // Record internal n8n event trace
      store.create('auditLogs', {
        action: 'N8N_WEBHOOK_EMITTED',
        userId: 'system',
        userName: 'n8n Workflow Bridge',
        details: `Event [${payload.event}] prepared for n8n orchestrator`,
        payload
      });
      return;
    }

    try {
      // If user has an n8n server running
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch((err) => {
        console.warn('[NotificationService] n8n webhook delivery error:', err.message);
      });
    } catch (e) {
      // silent catch for resilient operation
    }
  }

  getDispatchLogs() {
    return this.simulatedDispatchLog;
  }
}

export const notificationService = new NotificationService();

