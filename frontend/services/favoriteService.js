import api from './api';

export const favoriteService = {
  // Get all favorited properties for logged-in user
  async getFavorites() {
    return await api.get('/users/favorites');
  },

  // Add property to favorites
  async addFavorite(propertyId) {
    return await api.post(`/users/favorites/${propertyId}`);
  },

  // Remove property from favorites
  async removeFavorite(propertyId) {
    return await api.delete(`/users/favorites/${propertyId}`);
  },
};
