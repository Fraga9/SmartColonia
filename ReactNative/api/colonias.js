import axios from 'axios';
import API_CONFIG from './config';

/**
 * API para gestión de colonias
 */
const ColoniasAPI = {
  /**
   * Crea una nueva colonia
   * @param {Object} data Datos de la colonia
   * @param {string} token Token de autenticación (opcional)
   * @returns {Promise<Object>} Respuesta de la API
   */
  createColonia: async (data, token = null) => {
    try {
      // Configurar headers
      const headers = token 
        ? { ...API_CONFIG.HEADERS, ...API_CONFIG.getAuthHeader(token) }
        : API_CONFIG.HEADERS;
      
      // Realizar petición
      API_CONFIG.logRequest('POST', `${API_CONFIG.BASE_URL}/colonias/`, data);
      
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/colonias/`, 
        data,
        { headers }
      );
      
      API_CONFIG.logResponse(response);
      return { success: true, data: response.data };
    } catch (error) {
      API_CONFIG.logError(error);
      return { 
        success: false, 
        error: error.response?.data?.detail || error.message,
        status: error.response?.status
      };
    }
  },

  /**
   * Obtiene todas las colonias
   * @param {string} token Token de autenticación (opcional)
   * @returns {Promise<Object>} Respuesta de la API
   */
  getColonias: async (token = null) => {
    try {
      const headers = token 
        ? { ...API_CONFIG.HEADERS, ...API_CONFIG.getAuthHeader(token) }
        : API_CONFIG.HEADERS;
      
      API_CONFIG.logRequest('GET', `${API_CONFIG.BASE_URL}/colonias/`);
      
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/colonias/`,
        { headers }
      );
      
      API_CONFIG.logResponse(response);
      return { success: true, data: response.data };
    } catch (error) {
      API_CONFIG.logError(error);
      return { 
        success: false, 
        error: error.response?.data?.detail || error.message,
        status: error.response?.status
      };
    }
  },

  /**
   * Obtiene una colonia por su ID
   * @param {string} id ID de la colonia
   * @param {string} token Token de autenticación (opcional)
   * @returns {Promise<Object>} Respuesta de la API
   */
  getColoniaById: async (id, token = null) => {
    try {
      const headers = token 
        ? { ...API_CONFIG.HEADERS, ...API_CONFIG.getAuthHeader(token) }
        : API_CONFIG.HEADERS;
      
      API_CONFIG.logRequest('GET', `${API_CONFIG.BASE_URL}/colonias/${id}`);
      
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/colonias/${id}`,
        { headers }
      );
      
      API_CONFIG.logResponse(response);
      return { success: true, data: response.data };
    } catch (error) {
      API_CONFIG.logError(error);
      return { 
        success: false, 
        error: error.response?.data?.detail || error.message,
        status: error.response?.status
      };
    }
  }
};

export default ColoniasAPI;