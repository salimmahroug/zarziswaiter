export type EventType = 'marriage' | 'fiancaille' | 'anniversaire' | 'autre';
export type CatererType = 'chef-souma' | 'ayoub-chaftar' | 'prive-sans-traiteur';

export interface ServerPaymentRecord {
  amount: number;
  date: Date;
  remaining: number;
  paymentMethod?: string;
  notes?: string;
}

export interface Server {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  totalEvents: number;
  totalEarnings: number;
  totalEarningsOriginal?: number; // Gains totaux originaux avant paiements
  totalPayments?: number; // Total des paiements effectués
  available: boolean;
  pricePerEvent: number;
  payments: ServerPaymentRecord[];
}

export interface EventDetails {
  id: string;
  clientName: string;
  eventType: EventType;
  caterer: CatererType;
  catererPrice?: number; // Prix du traiteur si applicable
  date: Date;
  location: string;
  numberOfServers: number;
  pricePerServer: number;
  serverPayAmount: number; // Prix donné à chaque serveur
  totalAmount: number;
  companyCommission: number;
  netAmount: number;
  notes?: string;
  assignedServers: ServerAssignment[];
}

export interface ServerAssignment {
  serverId: string;
  payment: number;
  isPaid: boolean;
  paymentDate?: Date;
  paymentMethod?: string;
}
