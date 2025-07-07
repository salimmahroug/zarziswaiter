
import axios from 'axios';

// Determine API URL based on environment
const getApiUrl = () => {
  // En production, utiliser l'URL de l'API déployée
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://zarziswaiter-2.onrender.com/api';
  }
  
  // En développement, utiliser l'IP locale pour les tests mobiles
  const IP_ADDRESS = '192.168.100.145'; // Votre IP WiFi actuelle
  return `http://${IP_ADDRESS}:5001/api`;
};

const API_URL = getApiUrl();

// Logs pour déboguer la connexion API
console.log('API URL:', API_URL);
console.log('Environment:', import.meta.env.MODE);

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
