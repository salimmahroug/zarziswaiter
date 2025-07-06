import React from "react";
import { Server } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  calculateTotalPaid,
  calculateOriginalEarnings,
  formatCurrency,
} from "@/lib/payment-utils";
import {
  Phone,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  Wallet,
  CreditCard,
  TrendingDown,
  History,
} from "lucide-react";

interface ServerDetailsProps {
  server: Server;
}

export function ServerDetails({ server }: ServerDetailsProps) {
  // Utiliser les fonctions utilitaires pour les calculs
  const totalPaid = calculateTotalPaid(server);
  const remainingAmount = server.totalEarnings || 0;
  const originalTotalEarnings = calculateOriginalEarnings(server);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{server.name}</span>
          <Badge variant={server.available ? "default" : "destructive"}>
            {server.available ? "Disponible" : "Non disponible"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {server.phone || "Aucun numéro de téléphone"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {server.totalEvents} événement{server.totalEvents > 1 ? "s" : ""}{" "}
            effectué{server.totalEvents > 1 ? "s" : ""}
          </span>
        </div>{" "}
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            Prix par événement: {formatCurrency(server.pricePerEvent)} DT
          </span>
        </div>
        {/* Gains totaux accumulés */}
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-blue-500" />
          <span className="text-sm">
            <span className="font-medium">Gains totaux accumulés:</span>{" "}
            {formatCurrency(originalTotalEarnings)} DT
          </span>
        </div>
        {/* Montant reçu */}
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-green-500" />
          <span className="text-sm">
            <span className="font-medium text-green-600">Argent reçu:</span>{" "}
            {formatCurrency(totalPaid)} DT
          </span>
        </div>
        {/* Montant restant */}
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-orange-500" />
          <span className="text-sm">
            <span className="font-medium text-orange-600">Reste à payer:</span>{" "}
            {formatCurrency(remainingAmount)} DT
          </span>
        </div>
        {/* Nombre de paiements */}
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-purple-500" />
          <span className="text-sm">
            <span className="font-medium">Paiements effectués:</span>{" "}
            {server.payments?.length || 0}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {server.available ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span className="text-sm">
            Statut: {server.available ? "Actif" : "Inactif"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
