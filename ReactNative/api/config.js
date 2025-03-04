const API_CONFIG = {
    BASE_URL: 'http://192.168.1.73:8000',  // Remove extra slash
    
    HEADERS: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },

    DEBUG: true,
    
    getAuthHeader: (token) => {
        if (API_CONFIG.DEBUG) {
            console.log('🔑 Adding auth token for:', API_CONFIG.BASE_URL);
        }
        return {
            'Authorization': `Bearer ${token}`
        };
    },

    logRequest: async (method, url, data = null) => {
        if (API_CONFIG.DEBUG) {
            console.group('🚀 API Request');
            console.log('URL:', url);
            console.log('Method:', method);
            console.log('Headers:', API_CONFIG.HEADERS);
            if (data) console.log('Data:', JSON.stringify(data, null, 2));
            console.groupEnd();

            // Test connection
            try {
                const testResponse = await fetch(url);
                console.log(`� Connection test: ${testResponse.ok ? '✅ Success' : '❌ Failed'}`);
            } catch (error) {
                console.error('❌ Connection test failed:', error.message);
            }
        }
    },

    logResponse: (response) => {
        if (API_CONFIG.DEBUG) {
            console.group('✅ API Response');
            console.log('Status:', response.status);
            console.log('Headers:', response.headers);
            console.log('Data:', JSON.stringify(response.data, null, 2));
            console.groupEnd();
        }
    },

    logError: (error) => {
        if (API_CONFIG.DEBUG) {
            console.group('❌ API Error');
            console.error('Message:', error.message);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', error.response?.data);
                console.error('Headers:', error.response?.headers);
            }
            console.error('Stack:', error.stack);
            console.groupEnd();
        }
    }
};

export default API_CONFIG;