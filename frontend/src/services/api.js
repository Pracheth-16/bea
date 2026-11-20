const API_BASE = '/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('itsm_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('itsm_token', token);
    } else {
      localStorage.removeItem('itsm_token');
    }
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });

      if (response.status === 401) {
        // Clear invalid token
        this.setToken(null);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Server request failed');
        }
        return data;
      }

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      return response;
    } catch (err) {
      throw err;
    }
  }

  // Auth endpoints
  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  getMe() {
    return this.request('/auth/me');
  }

  getUsers() {
    return this.request('/auth/users');
  }

  // Ticket endpoints (FR-1, FR-2, FR-3, FR-6)
  getTickets(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/tickets${query ? `?${query}` : ''}`);
  }

  getTicket(id) {
    return this.request(`/tickets/${id}`);
  }

  createTicket(ticketData) {
    return this.request('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData)
    });
  }

  updateTicketStatus(id, status, resolutionNotes) {
    return this.request(`/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, resolutionNotes })
    });
  }

  reassignTicket(id, agentId) {
    return this.request(`/tickets/${id}/reassign`, {
      method: 'PATCH',
      body: JSON.stringify({ agentId })
    });
  }

  escalateTicket(id, reason) {
    return this.request(`/tickets/${id}/escalate`, {
      method: 'PATCH',
      body: JSON.stringify({ reason })
    });
  }

  // Asset endpoints (FR-5)
  getAssets(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/assets${query ? `?${query}` : ''}`);
  }

  getAsset(id) {
    return this.request(`/assets/${id}`);
  }

  createAsset(assetData) {
    return this.request('/assets', {
      method: 'POST',
      body: JSON.stringify(assetData)
    });
  }

  updateAsset(id, updates) {
    return this.request(`/assets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  addMaintenanceRecord(id, maintenanceData) {
    return this.request(`/assets/${id}/maintenance`, {
      method: 'POST',
      body: JSON.stringify(maintenanceData)
    });
  }

  deleteAsset(id) {
    return this.request(`/assets/${id}`, {
      method: 'DELETE'
    });
  }

  // Asset Request endpoints (FR-4)
  getAssetRequests() {
    return this.request('/asset-requests');
  }

  createAssetRequest(requestData) {
    return this.request('/asset-requests', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  reviewAssetRequest(id, status, reviewNotes, allocatedAssetId = null) {
    return this.request(`/asset-requests/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reviewNotes, allocatedAssetId })
    });
  }

  // Notification endpoints (FR-7)
  getNotifications() {
    return this.request('/notifications');
  }

  markNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PATCH'
    });
  }

  markAllNotificationsRead() {
    return this.request('/notifications/read-all', {
      method: 'PATCH'
    });
  }

  getDispatchLogs() {
    return this.request('/notifications/dispatch-logs');
  }

  // Report & Dashboard endpoints (FR-8)
  getDashboardMetrics() {
    return this.request('/reports/dashboard');
  }

  // Automation & AI endpoints
  evaluateSLA() {
    return this.request('/automation/sla/evaluate', {
      method: 'POST'
    });
  }

  aiClassify(title, description) {
    return this.request('/automation/ai/classify', {
      method: 'POST',
      body: JSON.stringify({ title, description })
    });
  }

  getAuditLogs() {
    return this.request('/automation/audit-logs');
  }

  resetDemoData() {
    return this.request('/automation/reset-demo', {
      method: 'POST'
    });
  }
}

export const api = new ApiClient();

