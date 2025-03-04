import axios from 'axios';
import API_CONFIG from './config';

const UsersAPI = {
  // Create a new user
  createUser: async (userData) => {
    try {
        API_CONFIG.logRequest('POST', `${API_CONFIG.BASE_URL}/usuarios/`, userData);
        
        const response = await axios.post(
            `${API_CONFIG.BASE_URL}/usuarios/`,
            userData,
            { headers: API_CONFIG.HEADERS }
        );
        
        API_CONFIG.logResponse(response);
        return { success: true, data: response.data };
    } catch (error) {
        API_CONFIG.logError(error);
        return { 
            success: false, 
            error: error.response?.data?.detail || error.message 
        };
    }
},
  
  // Get all users
  getUsers: async (token = null) => {
    try {
      const headers = token 
        ? { ...API_CONFIG.HEADERS, ...API_CONFIG.getAuthHeader(token) }
        : API_CONFIG.HEADERS;
        
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/usuarios/`,
        { headers }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching users:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.detail || error.message,
        status: error.response?.status
      };
    }
  },
  
  // Get user by ID
  getUserById: async (userId, token = null) => {
    try {
      const headers = token 
        ? { ...API_CONFIG.HEADERS, ...API_CONFIG.getAuthHeader(token) }
        : API_CONFIG.HEADERS;
        
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/usuarios/${userId}`,
        { headers }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching user by ID:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.detail || error.message,
        status: error.response?.status
      };
    }
  }
};

export default UsersAPI;