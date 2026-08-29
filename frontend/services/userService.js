import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const userService = {
  // Fetch user profile
  async getProfile() {
    return await api.get('/users/profile');
  },

  // Update user profile (name, phone, bio, profileImage, password)
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
};
