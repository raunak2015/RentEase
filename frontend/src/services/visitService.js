import api from './api';

export const visitService = {
  // Tenant: submit a new visit request
  async createVisitRequest(data) {
    return await api.post('/visits', data);
  },

  // Tenant: get all their own visit requests
  async getTenantVisits() {
    return await api.get('/visits/my-requests');
  },

  // Owner: get all incoming visit requests for their properties
  async getOwnerVisits() {
    return await api.get('/visits/incoming');
  },

  // Update status of a visit request (owner: accept/reject, tenant: cancel)
  async updateVisitStatus(visitId, status) {
    return await api.patch(`/visits/${visitId}/status`, { status });
  },
};
