import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  // Register new user
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data && response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data));
    }
    return response;
  },

  // Login user
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data && response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data));
    }
    return response;
  },

  // Get profile
  async getProfile() {
    return await api.get('/users/profile');
  },

  // Update profile
  async updateProfile(profileData) {
    const response = await api.put('/users/profile', profileData);
    if (response.data) {
      const storedUser = await AsyncStorage.getItem('userData');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const updated = { ...parsed, ...response.data };
        await AsyncStorage.setItem('userData', JSON.stringify(updated));
      }
    }
    return response;
  },

  // Forgot Password
  async forgotPassword(email) {
    return await api.post('/auth/forgot-password', { email });
  },

  // Logout
  async logout() {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
  },
};
