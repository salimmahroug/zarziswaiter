import React from "react";
import { PayrollGenerator } from "@/components/servers/PayrollGenerator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, CreditCard } from "lucide-react";

export default function Payroll() {
  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" />
            Fiches de Paie
          </h1>
          <p className="text-muted-foreground mt-2">
            Générez et téléchargez les fiches de paie pour vos serveurs
          </p>
        </div>
      </div>

      {/* Informations importantes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">Téléchargement</h3>
                <p className="text-sm text-blue-700">
                  Les fiches peuvent être téléchargées en format texte ou
                  imprimées directement
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">Paiements</h3>
                <p className="text-sm text-green-700">
                  Seuls les événements avec statut de paiement sont inclus dans
                  les fiches
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Générateur de fiche de paie */}
      <PayrollGenerator />
    </div>
  );
}
