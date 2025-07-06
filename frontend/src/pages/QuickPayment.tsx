import React from "react";
import { QuickPayment } from "@/components/servers/QuickPayment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Zap, CheckCircle2 } from "lucide-react";

export default function QuickPaymentPage() {
  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
          <Zap className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Paiement Rapide</h1>
          <p className="text-muted-foreground">
            Sélectionnez un événement et payez instantanément le montant dû
          </p>
        </div>
      </div>

      {/* Instructions */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle2 className="h-5 w-5" />
            Comment ça marche
          </CardTitle>
        </CardHeader>
        <CardContent className="text-green-700">
          <ol className="list-decimal list-inside space-y-2">
            <li>Sélectionnez le serveur à payer</li>
            <li>Choisissez l'événement dans la liste</li>
            <li>Le montant est calculé automatiquement</li>
            <li>Confirmez le paiement en un clic !</li>
          </ol>
        </CardContent>
      </Card>

      {/* Composant de paiement rapide */}
      <div className="max-w-2xl">
        <QuickPayment />
      </div>
    </div>
  );
}
