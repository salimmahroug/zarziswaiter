import api from './api';
import { Server } from '@/types';

const BASE_URL = "/servers";

// Récupérer tous les serveurs
export const getAllServers = async (): Promise<Server[]> => {
  const response = await api.get(BASE_URL);
  return response.data;
};

// Récupérer un serveur par son ID
export const getServerById = async (id: string): Promise<Server> => {
  const response = await api.get(`${BASE_URL}/${id}/details`);
  return response.data;
};

// Créer un nouveau serveur
export const createServer = async (server: Omit<Server, "id">): Promise<Server> => {
  const response = await api.post(BASE_URL, server);
  return {
    ...response.data,
    id: response.data._id || response.data.id
  };
};

// Mettre à jour un serveur
export const updateServer = async (id: string, server: Partial<Server>): Promise<Server> => {
  const response = await api.put(`${BASE_URL}/${id}`, server);
  return {
    ...response.data,
    id: response.data._id || response.data.id
  };
};

// Supprimer un serveur
export const deleteServer = async (id: string): Promise<void> => {
  if (!id) {
    throw new Error('Server ID is required');
  }
  
  const url = `${BASE_URL}/${id}`;
  await api.delete(url);
};

// Basculer la disponibilité d'un serveur
export const toggleServerAvailability = async (id: string): Promise<Server> => {
  const response = await api.put(`${BASE_URL}/${id}/toggle-availability`);
  return response.data;
};

// Récupérer les statistiques d'un serveur
export const getServerStats = async (id: string) => {
  const response = await api.get(`${BASE_URL}/stats/${id}`);
  return response.data;
};

// Ajouter un paiement à un serveur
export const addServerPayment = async (
  serverId: string, 
  paymentData: {
    amount: number;
    paymentMethod?: string;
    notes?: string;
  }
) => {
  const response = await api.post(`${BASE_URL}/${serverId}/payment`, paymentData);
  return response.data;
};

// Export de l'objet service pour compatibilité
export const serverService = {
  getAllServers,
  getServerById,
  createServer,
  updateServer,
  deleteServer,
  toggleServerAvailability,
  getServerStats,
  addServerPayment,
};
