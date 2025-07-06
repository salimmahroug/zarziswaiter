import api from './api';
import { EventDetails, Server } from '@/types';

export const getEvents = async (): Promise<EventDetails[]> => {
  try {
    console.log('Fetching events...');
    const response = await api.get('/events');
    console.log('Events fetched:', response.data.length);
    return response.data.map((event: any) => ({
      ...event,
      id: event._id,
      date: new Date(event.date),
      assignedServers: event.assignedServers.map((server: any) => ({
        ...server,
        id: server._id
      }))
    }));
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

export const getEvent = async (id: string): Promise<EventDetails> => {
  try {
    const response = await api.get(`/events/${id}`);
    const event = response.data;
    return {
      ...event,
      id: event._id,
      date: new Date(event.date),
      assignedServers: event.assignedServers.map((server: any) => ({
        ...server,
        id: server._id
      }))
    };
  } catch (error) {
    console.error(`Error fetching event ${id}:`, error);
    throw error;
  }
};

export const createEvent = async (eventData: Omit<EventDetails, 'id'>): Promise<EventDetails> => {
  try {
    console.log('Creating event with data:', eventData);
    // Extract server IDs from assigned servers
    const assignedServerIds = eventData.assignedServers.map(server => server.id);
    
    const payload = {
      ...eventData,
      assignedServerIds,
      date: eventData.date.toISOString()
    };
    console.log('Event payload:', payload);
    
    const response = await api.post('/events', payload);
    
    const event = response.data;
    return {
      ...event,
      id: event._id,
      date: new Date(event.date),
      assignedServers: event.assignedServers.map((server: any) => ({
        ...server,
        id: server._id
      }))
    };
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

export const updateEvent = async (id: string, eventData: Partial<EventDetails>): Promise<EventDetails> => {
  const data: any = { ...eventData };
  
  // Handle date formatting
  if (data.date) {
    data.date = data.date.toISOString();
  }
  
  // Handle assigned servers
  if (data.assignedServers) {
    data.assignedServerIds = data.assignedServers.map((server: Server) => server.id);
    delete data.assignedServers;
  }
  
  const response = await api.put(`/events/${id}`, data);
  const event = response.data;
  
  return {
    ...event,
    id: event._id,
    date: new Date(event.date),
    assignedServers: event.assignedServers.map((server: any) => ({
      ...server,
      id: server._id
    }))
  };
};

export const deleteEvent = async (id: string): Promise<void> => {
  await api.delete(`/events/${id}`);
};

export const eventService = {
  // Récupérer tous les événements
  getAllEvents: async (): Promise<EventDetails[]> => {
    const response = await api.get('/events');
    return response.data;
  },

  // Récupérer les événements par traiteur
  getEventsByCaterer: async (caterer: string) => {
    try {
      const response = await api.get(`/events/by-caterer/${caterer}`);
      const data = response.data;
      
      // Transformer les événements pour convertir les dates et ajouter les IDs
      const transformedEvents = data.events ? data.events.map((event: any) => ({
        ...event,
        id: event._id || event.id,
        date: new Date(event.date),
        assignedServers: event.assignedServers ? event.assignedServers.map((server: any) => ({
          ...server,
          id: server._id || server.id
        })) : []
      })) : [];
      
      // Retourner les statistiques avec les événements transformés
      return {
        caterer: data.caterer?.code || caterer,
        totalEvents: data.stats?.totalEvents || 0,
        totalRevenue: data.stats?.totalRevenue || 0,
        totalCommission: data.stats?.totalCommission || 0,
        averageEventPrice: transformedEvents.length > 0 
          ? (data.stats?.totalRevenue || 0) / transformedEvents.length 
          : 0,
        events: transformedEvents
      };
    } catch (error) {
      console.error('Error fetching caterer events:', error);
      // Retourner des données par défaut en cas d'erreur
      return {
        caterer: caterer,
        totalEvents: 0,
        totalRevenue: 0,
        totalCommission: 0,
        averageEventPrice: 0,
        events: []
      };
    }
  },

  // Récupérer les statistiques des événements
  getEventStats: async () => {
    const response = await api.get('/events/stats');
    return response.data;
  },

  // Récupérer les revenus par mois
  getMonthlyRevenue: async () => {
    const response = await api.get('/events/monthly-revenue');
    return response.data;
  },

  // Récupérer les événements d'un serveur spécifique
  getServerEvents: async (serverId: string): Promise<EventDetails[]> => {
    try {
      const response = await api.get(`/events/server/${serverId}`);
      return response.data.map((event: EventDetails & { _id: string }) => ({
        ...event,
        id: event._id,
        date: new Date(event.date),
        assignedServers: event.assignedServers.map((server: Server & { _id: string }) => ({
          ...server,
          id: server._id
        }))
      }));
    } catch (error) {
      console.error(`Error fetching events for server ${serverId}:`, error);
      throw error;
    }
  },

  // Mettre à jour le statut de paiement d'un serveur pour un événement
  updateServerPayment: async (
    eventId: string, 
    serverId: string, 
    paymentData: {
      amountPaid?: number;
      isPaid?: boolean;
      paymentDate?: Date;
      paymentMethod?: string;
      notes?: string;
    }
  ) => {
    try {
      const response = await api.patch(`/events/${eventId}/server-payment/${serverId}`, paymentData);
      return response.data;
    } catch (error) {
      console.error(`Error updating payment for server ${serverId} in event ${eventId}:`, error);
      throw error;
    }
  },

  // Récupérer le résumé des paiements d'un serveur pour une période
  getServerPaymentSummary: async (
    serverId: string, 
    startDate?: string, 
    endDate?: string
  ) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await api.get(`/events/server/${serverId}/payments?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching payment summary for server ${serverId}:`, error);
      throw error;
    }
  },

  // Initialiser les paiements de serveurs pour les événements existants
  initializeServerPayments: async () => {
    try {
      const response = await api.post('/events/initialize-server-payments');
      return response.data;
    } catch (error) {
      console.error('Error initializing server payments:', error);
      throw error;
    }
  },

  // Réinitialiser tous les revenus et commissions à zéro
  resetRevenueAndCommissions: async () => {
    try {
      const response = await api.post('/events/reset-revenue');
      return response.data;
    } catch (error) {
      console.error('Error resetting revenue and commissions:', error);
      throw error;
    }
  },
};
