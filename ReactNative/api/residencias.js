import axios from 'axios';
import API_CONFIG from './config';

const ResidenciasAPI = {
  // Create a new residencia
  createResidencia: async (residenciaData, token = null) => {
    try {
      const headers = token 
        ? { ...API_CONFIG.HEADERS, ...API_CONFIG.getAuthHeader(token) }
        : API_CONFIG.HEADERS;
        
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/residencias/`, 
        residenciaData,
        { headers }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating residencia:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.detail || error.message,
        status: error.response?.status
      };
    }
  },
  
  // Get all residencias
  getResidencias: async (token = null) => {
    try {
      const headers = token 
        ? { ...API_CONFIG.HEADERS, ...API_CONFIG.getAuthHeader(token) }
        : API_CONFIG.HEADERS;
        
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/residencias/`,
        { headers }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching residencias:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.detail || error.message,
        status: error.response?.status
      };
    }
  },

  // Get residencia by ID
  getResidenciaById: async (id, token = null) => {
    try {
      const headers = token 
        ? { ...API_CONFIG.HEADERS, ...API_CONFIG.getAuthHeader(token) }
        : API_CONFIG.HEADERS;
        
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/residencias/${id}`,
        { headers }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching residencia:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.detail || error.message,
        status: error.response?.status
      };
    }
  }
};

export default ResidenciasAPI;