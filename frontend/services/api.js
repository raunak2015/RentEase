import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API configuration
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach Auth Token if available
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token from AsyncStorage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Format error messages
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message:
        error.response?.data?.message ||
        error.message ||
        'Network error. Please check your connection.',
      status: error.response?.status || 500,
      data: error.response?.data || null,
    };
    return Promise.reject(customError);
  }
);

export default api;
