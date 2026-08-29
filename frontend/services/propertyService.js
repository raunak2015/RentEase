import api from './api';

export const propertyService = {
  // Get all active properties (supports query params: type, search, minPrice, maxPrice, propertyCode)
  async getAllProperties(params = {}) {
    return await api.get('/properties', { params });
  },

  // Get single property details by ID
  async getPropertyById(id) {
    return await api.get(`/properties/${id}`);
  },

  // Get properties owned by the currently logged in owner
  async getOwnerProperties() {
    return await api.get('/properties/my-properties');
  },

  // Create a new property listing (Owner only)
  async createProperty(propertyData) {
    return await api.post('/properties', propertyData);
  },

  // Update a property listing (Owner only)
  async updateProperty(id, propertyData) {
    return await api.put(`/properties/${id}`, propertyData);
  },

  // Delete a property listing (Owner only)
  async deleteProperty(id) {
    return await api.delete(`/properties/${id}`);
  },
};
