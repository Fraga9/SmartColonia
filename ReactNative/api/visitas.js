import axios from 'axios';
import API_CONFIG from './config';

const VisitasAPI = {
  // Create a new visita
  createVisita: async (visitaData, token = null) => {
    try {
      const headers = token 
        ? { ...API_CONFIG.HEADERS, ...API_CONFIG.getAuthHeader(token) }
        : API_CONFIG.HEADERS;
        
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/visitas/`, 
        visitaData,
        { headers }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating visita:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.detail || error.message,
        status: error.response?.status
      };
    }
  },
  
  // Get all visitas
  getVisitas: async (token = null) => {
    try {
      const headers = token 
        ? { ...API_CONFIG.HEADERS, ...API_CONFIG.getAuthHeader(token) }
        : API_CONFIG.HEADERS;
        
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/visitas/`,
        { headers }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching visitas:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.detail || error.message,
        status: error.response?.status
      };
    }
  }
};

export default VisitasAPI;