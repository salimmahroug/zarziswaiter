
import { EventDetails, EventType, Server } from "@/types";

// Utilities for generating mock data
const randomId = () => Math.random().toString(36).substring(2, 9);
const randomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// Create mock servers
export const mockServers: Server[] = [
  {
    id: randomId(),
    name: "Mohamed Ben Ali",
    phone: "55123456",
    totalEvents: 12,
    totalEarnings: 1200,
    available: true
  },
  {
    id: randomId(),
    name: "Ahmed Trabelsi",
    phone: "55234567",
    totalEvents: 8,
    totalEarnings: 800,
    available: true
  },
  {
    id: randomId(),
    name: "Youssef Chebbi",
    phone: "55345678",
    totalEvents: 15,
    totalEarnings: 1500,
    available: true
  },
  {
    id: randomId(),
    name: "Ali Mansouri",
    phone: "55456789",
    totalEvents: 10,
    totalEarnings: 1000,
    available: false
  },
  {
    id: randomId(),
    name: "Karim Salah",
    phone: "55567890",
    totalEvents: 5,
    totalEarnings: 500,
    available: true
  },
];

// Generate event types
const eventTypes: EventType[] = ["marriage", "fiancaille", "anniversaire", "autre"];

// Create mock events
export const mockEvents: EventDetails[] = [
  {
    id: randomId(),
    clientName: "Fathi Belhaj",
    eventType: "marriage",
    date: randomDate(new Date(2024, 3, 1), new Date(2024, 5, 30)),
    location: "Salle El Habib, Zarzis",
    numberOfServers: 4,
    pricePerServer: 100,
    totalAmount: 400,
    companyCommission: 80, // 20 DT per server
    netAmount: 320,
    notes: "Menu spécial poisson et viande",
    assignedServers: [mockServers[0], mockServers[1], mockServers[2], mockServers[4]]
  },
  {
    id: randomId(),
    clientName: "Sami Chaouech",
    eventType: "fiancaille",
    date: randomDate(new Date(2024, 4, 1), new Date(2024, 5, 30)),
    location: "Villa Jasmine, Djerba",
    numberOfServers: 3,
    pricePerServer: 90,
    totalAmount: 270,
    companyCommission: 45, // 15 DT per server
    netAmount: 225,
    assignedServers: [mockServers[1], mockServers[3], mockServers[4]]
  },
  {
    id: randomId(),
    clientName: "Nour El Houda",
    eventType: "anniversaire",
    date: randomDate(new Date(2024, 5, 1), new Date(2024, 6, 30)),
    location: "Café Chergui, Zarzis",
    numberOfServers: 2,
    pricePerServer: 80,
    totalAmount: 160,
    companyCommission: 30, // 15 DT per server
    netAmount: 130,
    assignedServers: [mockServers[2], mockServers[0]]
  },
  {
    id: randomId(),
    clientName: "Slim Abidi",
    eventType: "marriage",
    date: randomDate(new Date(2024, 6, 1), new Date(2024, 7, 30)),
    location: "Hôtel Odyssee, Zarzis",
    numberOfServers: 6,
    pricePerServer: 110,
    totalAmount: 660,
    companyCommission: 120, // 20 DT per server
    netAmount: 540,
    assignedServers: [mockServers[0], mockServers[1], mockServers[2], mockServers[3], mockServers[4], mockServers[0]]
  },
  {
    id: randomId(),
    clientName: "Faouzi Benhamida",
    eventType: "autre",
    date: randomDate(new Date(2024, 7, 1), new Date(2024, 8, 30)),
    location: "Restaurant Le Petit Paris, Zarzis",
    numberOfServers: 2,
    pricePerServer: 95,
    totalAmount: 190,
    companyCommission: 30, // 15 DT per server
    netAmount: 160,
    assignedServers: [mockServers[3], mockServers[4]]
  }
];

// Chart data for dashboard
export const getRevenueChartData = () => {
  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  
  return months.map((month) => ({
    name: month,
    total: Math.floor(Math.random() * 3000) + 500,
    commission: Math.floor(Math.random() * 500) + 100,
  }));
};
