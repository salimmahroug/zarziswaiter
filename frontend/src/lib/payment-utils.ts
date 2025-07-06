import { Server, ServerPaymentRecord } from "@/types";

/**
 * Calcule le montant total reçu en paiements pour un serveur
 * @param server Le serveur dont on veut calculer les paiements totaux
 * @returns Le montant total des paiements reçus
 */
export function calculateTotalPaid(server: Server): number {
  if (!server.payments || server.payments.length === 0) {
    return 0;
  }
  
  return server.payments.reduce((sum, payment) => sum + payment.amount, 0);
}

/**
 * Calcule le montant total original des gains (avant paiements)
 * @param server Le serveur dont on veut calculer les gains originaux
 * @returns Le montant total des gains originaux
 */
export function calculateOriginalEarnings(server: Server): number {
  const totalPaid = calculateTotalPaid(server);
  const remainingAmount = server.totalEarnings || 0;
  
  return remainingAmount + totalPaid;
}

/**
 * Formate un nombre avec 2 décimales pour l'affichage monétaire
 * @param amount Le montant à formater
 * @returns La chaîne formatée
 */
export function formatCurrency(amount: number): string {
  return amount.toFixed(2);
}
