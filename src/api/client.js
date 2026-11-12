// LPG Tracker Connected API Client Service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('lpg_token') || null;
    this.activeRole = 'NOC_SUPER_ADMIN';
  }

  setRole(role) {
    this.activeRole = role;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('lpg_token', token);
    } else {
      localStorage.removeItem('lpg_token');
    }
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'x-demo-role': this.activeRole,
      ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
      ...(options.headers || {})
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status} Error`);
      }

      return await response.json();
    } catch (err) {
      console.warn(`[API CLIENT OFFLINE/FALLBACK]: ${endpoint}`, err.message);
      // Return null to allow UI to gracefully handle or use local fallback
      throw err;
    }
  }

  // Auth
  login(phone, password, role) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone_number: phone, password, role })
    });
  }

  // Organizations
  getOrganizations(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/organizations?${query}`);
  }

  approveOrganization(orgId, formalReason) {
    return this.request(`/organizations/${orgId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ formal_reason: formalReason })
    });
  }

  // Dispatches
  getDispatches(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/dispatches?${query}`);
  }

  createDispatch(dispatchPayload) {
    return this.request('/dispatches', {
      method: 'POST',
      body: JSON.stringify(dispatchPayload)
    });
  }

  // Receiving
  confirmReceiving(payload) {
    return this.request('/receiving/confirm', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Discrepancies
  getDiscrepancies(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/discrepancies?${query}`);
  }

  transitionDiscrepancyStatus(caseId, targetStatus, reason) {
    return this.request(`/discrepancies/${caseId}/status`, {
      method: 'POST',
      body: JSON.stringify({ target_status: targetStatus, administrative_reason: reason })
    });
  }

  // Public
  getPublicAvailability(district = 'ALL') {
    return this.request(`/public/availability?district=${district}`);
  }

  submitComplaint(complaintData) {
    return this.request('/public/complaints', {
      method: 'POST',
      body: JSON.stringify(complaintData)
    });
  }

  trackComplaint(ticketNumber) {
    return this.request(`/public/complaints/${ticketNumber}`);
  }

  registerOrganization(payload) {
    return this.request('/auth/register-organization', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Audit
  getAuditLogs(limit = 50) {
    return this.request(`/audit/logs?limit=${limit}`);
  }

  verifyAuditSeal() {
    return this.request('/audit/verify');
  }
}

export const api = new ApiClient();
export default api;

