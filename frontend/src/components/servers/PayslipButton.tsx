import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { PayslipGenerator, PayslipData } from "@/lib/payslip-generator";
import { PayslipPreview } from "./PayslipPreview";
import { Server } from "@/types";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { FileText, Download } from "lucide-react";

interface PayslipButtonProps {
  server: Server;
  paymentAmount?: number;
  paymentDate?: Date;
  paymentMethod?: string;
  paymentReference?: string;
  events?: Array<{
    id: string;
    clientName: string;
    eventType: string;
    date: Date;
    location: string;
    amountDue: number;
    amountPaid: number;
    isPaid: boolean;
    paymentDate?: Date;
    paymentMethod?: string;
  }>;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg";
}

export function PayslipButton({
  server,
  paymentAmount,
  paymentDate = new Date(),
  paymentMethod = "Espèces",
  paymentReference,
  events = [],
  className,
  variant = "outline",
  size = "default",
}: PayslipButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    return format(paymentDate, "yyyy-MM");
  });

  const generatePayslipData = (): PayslipData | null => {
    const [year, month] = selectedPeriod.split("-").map(Number);
    const periodStart = startOfMonth(new Date(year, month - 1));
    const periodEnd = endOfMonth(new Date(year, month - 1));

    // Use provided events or create a mock event based on payment
    let payslipEvents = events;

    if (payslipEvents.length === 0 && paymentAmount) {
      // Create a mock event for the payment
      payslipEvents = [{
        id: `payment-${Date.now()}`,
        clientName: "Paiement effectué",
        eventType: "Paiement",
        date: paymentDate,
        location: "-",
        amountDue: paymentAmount,
        amountPaid: paymentAmount,
        isPaid: true,
        paymentDate,
        paymentMethod,
      }];
    }

    if (payslipEvents.length === 0) {
      return null;
    }

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
      paymentInfo: paymentAmount ? {
        paymentDate,
        paymentMethod,
        paymentReference,
      } : undefined,
    };
  };

  const handleDirectDownload = async () => {
    const payslipData = generatePayslipData();
    if (payslipData) {
      try {
        await PayslipGenerator.generateAndDownload(payslipData);
        setIsDialogOpen(false);
      } catch (error) {
        console.error('Erreur génération PDF:', error);
        alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
      }
    }
  };

  const payslipData = generatePayslipData();

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <FileText className="w-4 h-4 mr-2" />
          Fiche de Paie
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Générer une Fiche de Paie</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Serveur :</p>
            <p className="font-medium">{server.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Période :
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

          {payslipData && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Événements :</span>
                  <span className="font-medium">{payslipData.summary.totalEvents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total gagné :</span>
                  <span className="font-medium text-green-600">
                    {payslipData.summary.totalEarnings.toFixed(3)} DT
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total payé :</span>
                  <span className="font-medium text-blue-600">
                    {payslipData.summary.totalPaid.toFixed(3)} DT
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {payslipData ? (
              <>
                <Button
                  onClick={handleDirectDownload}
                  className="flex items-center gap-2 flex-1"
                >
                  <Download className="w-4 h-4" />
                  Télécharger PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(true)}
                  className="flex items-center gap-2 flex-1"
                >
                  <FileText className="w-4 h-4" />
                  Prévisualiser
                </Button>
              </>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>Aucune donnée disponible pour cette période</p>
              </div>
            )}
          </div>
        </div>

        {/* Preview Dialog */}
        {showPreview && payslipData && (
          <Dialog open onOpenChange={() => setShowPreview(false)}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <PayslipPreview
                data={payslipData}
                onClose={() => setShowPreview(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
