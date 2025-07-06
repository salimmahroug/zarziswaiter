
import axios from 'axios';

// Determine API URL based on environment
// Use the explicit IP address to ensure connectivity from mobile devices
// You can use either localhost or 192.168.100.145 (your WiFi IP) for development
const IP_ADDRESS = '192.168.100.145'; // Your current WiFi IP address
const API_URL = `http://${IP_ADDRESS}:5001/api`;

// Add console logs to help debug the API connection
console.log('API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
