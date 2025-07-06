import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PayslipGenerator, PayslipData } from "@/lib/payslip-generator";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Download,
  FileText,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  Printer,
  Eye,
} from "lucide-react";

interface PayslipPreviewProps {
  data: PayslipData;
  onDownload?: () => void;
  onClose?: () => void;
}

export function PayslipPreview({ data, onDownload, onClose }: PayslipPreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 3,
    }).format(amount);
  };

  const formatDate = (date: Date): string => {
    return format(date, 'dd/MM/yyyy', { locale: fr });
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await PayslipGenerator.generateAndDownload(data);
      onDownload?.();
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    } finally {
      setIsGenerating(false);
    }
  };

  const { server, period, events, summary, paymentInfo } = data;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-blue-600 flex items-center justify-center gap-2">
            <FileText className="w-6 h-6" />
            FICHE DE PAIE
          </CardTitle>
          <p className="text-gray-600">Waiter of Zarzis</p>
        </CardHeader>
      </Card>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Button 
          onClick={handleDownload} 
          disabled={isGenerating}
          className="flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Génération...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Télécharger PDF
            </>
          )}
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" />
          Imprimer
        </Button>
        {onClose && (
          <Button variant="secondary" onClick={onClose}>
            Retour
          </Button>
        )}
      </div>

      {/* Server & Period Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5" />
              Informations du Serveur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Nom :</span> {server.name}
            </div>
            <div>
              <span className="font-medium">ID :</span> {server.id}
            </div>
            {server.phone && (
              <div>
                <span className="font-medium">Téléphone :</span> {server.phone}
              </div>
            )}
            {server.email && (
              <div>
                <span className="font-medium">Email :</span> {server.email}
              </div>
            )}
            {server.address && (
              <div>
                <span className="font-medium">Adresse :</span> {server.address}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5" />
              Période de Paie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Du :</span> {formatDate(period.start)}
            </div>
            <div>
              <span className="font-medium">Au :</span> {formatDate(period.end)}
            </div>
            {paymentInfo && (
              <>
                <Separator className="my-2" />
                <div>
                  <span className="font-medium">Date de paiement :</span> {formatDate(paymentInfo.paymentDate)}
                </div>
                <div>
                  <span className="font-medium">Méthode :</span> {paymentInfo.paymentMethod}
                </div>
                {paymentInfo.paymentReference && (
                  <div>
                    <span className="font-medium">Référence :</span> {paymentInfo.paymentReference}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé des Gains</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Nombre d'événements</p>
              <p className="text-2xl font-bold text-blue-600">{summary.totalEvents}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total gagné</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalEarnings)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total payé</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalPaid)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalPending)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Détail des Événements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">Date</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Client</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Type</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Lieu</th>
                  <th className="border border-gray-200 px-4 py-2 text-right">Montant Dû</th>
                  <th className="border border-gray-200 px-4 py-2 text-right">Montant Payé</th>
                  <th className="border border-gray-200 px-4 py-2 text-center">Statut</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2">
                      {formatDate(event.date)}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      {event.clientName}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      {event.eventType}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      {event.location}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-right">
                      {formatCurrency(event.amountDue)}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-right">
                      {formatCurrency(event.amountPaid)}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      <Badge
                        variant={event.isPaid ? "default" : "destructive"}
                        className="flex items-center gap-1 w-fit mx-auto"
                      >
                        {event.isPaid ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            PAYÉ
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3" />
                            EN ATTENTE
                          </>
                        )}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 border-t pt-4">
        <p>Document généré le {formatDate(new Date())}</p>
        <p>Waiter of Zarzis - Système de Gestion des Serveurs</p>
      </div>
    </div>
  );
}
