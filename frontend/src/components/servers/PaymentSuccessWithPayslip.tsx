import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PayslipGenerator, PayslipData } from "@/lib/payslip-generator";
import { PayslipPreview } from "./PayslipPreview";
import { eventService } from "@/services/eventService";
import { Server, EventDetails, ServerAssignment } from "@/types";
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";
import {
  FileText,
  Download,
  Calendar,
  DollarSign,
  CheckCircle,
} from "lucide-react";

interface PaymentSuccessWithPayslipProps {
  server: Server;
  paymentAmount: number;
  paymentDate: Date;
  paymentMethod: string;
  paymentReference?: string;
  onClose: () => void;
}

export function PaymentSuccessWithPayslip({
  server,
  paymentAmount,
  paymentDate,
  paymentMethod,
  paymentReference,
  onClose,
}: PaymentSuccessWithPayslipProps) {
  const [showPayslip, setShowPayslip] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    return format(paymentDate, "yyyy-MM");
  });

  const { data: events = [] } = useQuery({
    queryKey: ["events"],
    queryFn: () => eventService.getAllEvents(),
  });

  const generatePayslipData = (): PayslipData | null => {
    const [year, month] = selectedPeriod.split("-").map(Number);
    const periodStart = startOfMonth(new Date(year, month - 1));
    const periodEnd = endOfMonth(new Date(year, month - 1));

    // Filter events for this server and period
    const serverEvents = events.filter((event: EventDetails) => {
      const eventDate = new Date(event.date);
      const hasServerAssigned = event.assignedServers?.some(
        (assignment: ServerAssignment) => assignment.serverId === server.id
      );
      return hasServerAssigned && isWithinInterval(eventDate, {
        start: periodStart,
        end: periodEnd,
      });
    });

    if (serverEvents.length === 0) {
      return null;
    }

    const payslipEvents = serverEvents.map((event: EventDetails) => {
      const serverAssignment = event.assignedServers?.find(
        (assignment: ServerAssignment) => assignment.serverId === server.id
      );
      
      return {
        id: event.id,
        clientName: event.clientName,
        eventType: event.eventType,
        date: new Date(event.date),
        location: event.location,
        amountDue: serverAssignment?.payment || 0,
        amountPaid: serverAssignment?.isPaid ? serverAssignment.payment : 0,
        isPaid: serverAssignment?.isPaid || false,
        paymentDate: serverAssignment?.isPaid ? paymentDate : undefined,
        paymentMethod: serverAssignment?.isPaid ? paymentMethod : undefined,
      };
    });

    const totalEarnings = payslipEvents.reduce((sum, event) => sum + event.amountDue, 0);
    const totalPaid = payslipEvents.reduce((sum, event) => sum + event.amountPaid, 0);
    const totalPending = totalEarnings - totalPaid;

    return {
      server: {
        id: server.id,
        name: server.name,
        phone: server.phone,
        email: server.email,
      },
      period: {
        start: periodStart,
        end: periodEnd,
      },
      events: payslipEvents,
      summary: {
        totalEvents: payslipEvents.length,
        totalEarnings,
        totalPaid,
        totalPending,
      },
      paymentInfo: {
        paymentDate,
        paymentMethod,
        paymentReference,
      },
    };
  };

  const payslipData = generatePayslipData();

  const handleGeneratePayslip = async () => {
    if (payslipData) {
      try {
        await PayslipGenerator.generateAndDownload(payslipData);
      } catch (error) {
        console.error('Erreur génération PDF:', error);
        alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
      }
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            Paiement Effectué avec Succès
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Détails du Paiement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Serveur :</span>
                <span className="font-medium">{server.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Montant payé :</span>
                <span className="font-bold text-green-600 text-lg">
                  {paymentAmount.toFixed(3)} DT
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Date :</span>
                <span className="font-medium">
                  {format(paymentDate, "dd MMMM yyyy", { locale: fr })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Méthode :</span>
                <Badge variant="outline">{paymentMethod}</Badge>
              </div>
              {paymentReference && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Référence :</span>
                  <span className="font-mono text-sm">{paymentReference}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payslip Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Générer une Fiche de Paie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Période de la fiche de paie :
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const date = new Date();
                    date.setMonth(date.getMonth() - i);
                    const value = format(date, "yyyy-MM");
                    const label = format(date, "MMMM yyyy", { locale: fr });
                    return (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>

              {payslipData ? (
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Événements :</span>
                        <span className="font-medium ml-2">{payslipData.summary.totalEvents}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total gagné :</span>
                        <span className="font-medium ml-2 text-green-600">
                          {payslipData.summary.totalEarnings.toFixed(3)} DT
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleGeneratePayslip}
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Télécharger PDF
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowPayslip(true)}
                      className="flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Prévisualiser
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>Aucun événement trouvé pour cette période</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Terminer
            </Button>
          </div>
        </div>

        {/* Payslip Preview Dialog */}
        {showPayslip && payslipData && (
          <Dialog open onOpenChange={() => setShowPayslip(false)}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <PayslipPreview
                data={payslipData}
                onClose={() => setShowPayslip(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
