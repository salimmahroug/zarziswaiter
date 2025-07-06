import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { eventService } from "@/services/eventService";
import { serverService } from "@/services/serverService";
import { Server, EventDetails } from "@/types";
import { PayslipPreview } from "./PayslipPreview";
import { PayslipGenerator, PayslipData } from "@/lib/payslip-generator";

interface EventWithServerPayments extends EventDetails {
  serverPayments?: Array<{
    serverId: string;
    amountDue: number;
    amountPaid: number;
    isPaid: boolean;
    paymentDate?: Date;
    paymentMethod?: string;
  }>;
}
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  isWithinInterval,
} from "date-fns";
import { fr } from "date-fns/locale";
import {
  Download,
  FileText,
  Calendar,
  DollarSign,
  User,
  CheckCircle,
  AlertCircle,
  Clock,
  Printer,
} from "lucide-react";

interface PayrollData {
  server: {
    id: string;
    name: string;
    phone?: string;
  };
  period: {
    start: Date;
    end: Date;
  };
  events: Array<{
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
  summary: {
    totalEvents: number;
    totalEarnings: number;
    totalPaid: number;
    totalPending: number;
  };
}

export function PayrollGenerator() {
  const [selectedServerId, setSelectedServerId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return format(now, "yyyy-MM");
  });
  const [showPayslip, setShowPayslip] = useState(false);

  const { data: servers = [] } = useQuery({
    queryKey: ["servers"],
    queryFn: () => serverService.getAllServers(),
  });

  const { data: events = [] } = useQuery({
    queryKey: ["events"],
    queryFn: () => eventService.getAllEvents(),
  });

  const payrollData = useMemo((): PayrollData | null => {
    if (!selectedServerId) return null;

    const server = servers.find((s: Server) => s.id === selectedServerId);
    if (!server) return null;

    const [year, month] = selectedMonth.split("-").map(Number);
    const periodStart = startOfMonth(new Date(year, month - 1));
    const periodEnd = endOfMonth(new Date(year, month - 1)); // Filtrer les événements pour ce serveur et cette période
    const serverEvents = events
      .filter((event: EventWithServerPayments) => {
        const eventDate = new Date(event.date);
        const isInPeriod = isWithinInterval(eventDate, {
          start: periodStart,
          end: periodEnd,
        });
        const isAssignedToServer = event.assignedServers?.some(
          (s: { id: string; name: string }) => s.id === selectedServerId
        );
        return isInPeriod && isAssignedToServer;
      })
      .map((event: EventWithServerPayments) => {
        // Trouver les informations de paiement pour ce serveur
        const serverPayment = event.serverPayments?.find(
          (p: { serverId: string }) => p.serverId === selectedServerId
        );

        return {
          id: event.id,
          clientName: event.clientName,
          eventType: event.eventType,
          date: new Date(event.date),
          location: event.location,
          amountDue: serverPayment?.amountDue || event.serverPayAmount || 0,
          amountPaid: serverPayment?.amountPaid || 0,
          isPaid: serverPayment?.isPaid || false,
          paymentDate: serverPayment?.paymentDate
            ? new Date(serverPayment.paymentDate)
            : undefined,
          paymentMethod: serverPayment?.paymentMethod,
        };
      });

    const summary = {
      totalEvents: serverEvents.length,
      totalEarnings: serverEvents.reduce((sum, e) => sum + e.amountDue, 0),
      totalPaid: serverEvents.reduce((sum, e) => sum + e.amountPaid, 0),
      totalPending: serverEvents.reduce(
        (sum, e) => sum + (e.amountDue - e.amountPaid),
        0
      ),
    };

    return {
      server,
      period: { start: periodStart, end: periodEnd },
      events: serverEvents,
      summary,
    };
  }, [selectedServerId, selectedMonth, servers, events]);

  const convertToPayslipData = (data: PayrollData): PayslipData => {
    return {
      server: {
        id: data.server.id,
        name: data.server.name,
        phone: data.server.phone,
      },
      period: data.period,
      events: data.events.map((event) => ({
        id: event.id,
        clientName: event.clientName,
        eventType: event.eventType,
        date: event.date,
        location: event.location,
        amountDue: event.amountDue,
        amountPaid: event.amountPaid,
        isPaid: event.isPaid,
        paymentDate: event.paymentDate,
        paymentMethod: event.paymentMethod,
      })),
      summary: data.summary,
    };
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "marriage":
        return "💒";
      case "fiancaille":
        return "💍";
      case "anniversaire":
        return "🎂";
      default:
        return "🎉";
    }
  };

  const getPaymentMethodLabel = (method?: string) => {
    switch (method) {
      case "cash":
        return "Espèces";
      case "transfer":
        return "Virement";
      case "check":
        return "Chèque";
      case "other":
        return "Autre";
      default:
        return "Non spécifié";
    }
  };

  const downloadPayroll = () => {
    if (!payrollData) return;

    // Créer le contenu de la fiche de paie
    const content = generatePayrollContent(payrollData);

    // Créer et télécharger le fichier
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fiche-paie-${payrollData.server.name}-${selectedMonth}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const printPayroll = () => {
    if (!payrollData) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const content = generatePrintablePayroll(payrollData);
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const generatePayrollContent = (data: PayrollData): string => {
    const periodStr = `${format(data.period.start, "MMMM yyyy", {
      locale: fr,
    })}`;

    return `
========================================
           FICHE DE PAIE
========================================

Serveur: ${data.server.name}
${data.server.phone ? `Téléphone: ${data.server.phone}` : ""}
Période: ${periodStr}
Date d'émission: ${format(new Date(), "dd/MM/yyyy")}

========================================
           DÉTAIL DES ÉVÉNEMENTS
========================================

${data.events
  .map(
    (event, index) => `
${index + 1}. ${event.clientName}
   Type: ${event.eventType}
   Date: ${format(event.date, "dd/MM/yyyy")}
   Lieu: ${event.location}
   Montant: ${event.amountDue} DT
   Statut: ${event.isPaid ? "✓ Payé" : "⏳ En attente"}
   ${
     event.isPaid && event.paymentDate
       ? `Payé le: ${format(event.paymentDate, "dd/MM/yyyy")}`
       : ""
   }
   ${
     event.isPaid && event.paymentMethod
       ? `Méthode: ${getPaymentMethodLabel(event.paymentMethod)}`
       : ""
   }
`
  )
  .join("")}

========================================
               RÉCAPITULATIF
========================================

Nombre d'événements: ${data.summary.totalEvents}
Total des gains: ${data.summary.totalEarnings} DT
Montant payé: ${data.summary.totalPaid} DT
Montant en attente: ${data.summary.totalPending} DT

========================================
`;
  };

  const generatePrintablePayroll = (data: PayrollData): string => {
    const periodStr = `${format(data.period.start, "MMMM yyyy", {
      locale: fr,
    })}`;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Fiche de Paie - ${data.server.name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .info-section { margin-bottom: 20px; }
        .events-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .events-table th, .events-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .events-table th { background-color: #f2f2f2; }
        .summary { background-color: #f9f9f9; padding: 15px; border-radius: 5px; }
        .paid { color: green; font-weight: bold; }
        .pending { color: orange; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>FICHE DE PAIE</h1>
        <h2>${data.server.name}</h2>
        <p>Période: ${periodStr}</p>
        <p>Date d'émission: ${format(new Date(), "dd/MM/yyyy")}</p>
    </div>

    <div class="info-section">
        <h3>Informations du serveur</h3>
        <p><strong>Nom:</strong> ${data.server.name}</p>
        ${
          data.server.phone
            ? `<p><strong>Téléphone:</strong> ${data.server.phone}</p>`
            : ""
        }
    </div>

    <h3>Détail des événements</h3>
    <table class="events-table">
        <thead>
            <tr>
                <th>Date</th>
                <th>Client</th>
                <th>Type</th>
                <th>Lieu</th>
                <th>Montant</th>
                <th>Statut</th>
            </tr>
        </thead>
        <tbody>
            ${data.events
              .map(
                (event) => `
                <tr>
                    <td>${format(event.date, "dd/MM/yyyy")}</td>
                    <td>${event.clientName}</td>
                    <td>${event.eventType}</td>
                    <td>${event.location}</td>
                    <td>${event.amountDue} DT</td>
                    <td class="${event.isPaid ? "paid" : "pending"}">
                        ${event.isPaid ? "✓ Payé" : "⏳ En attente"}
                    </td>
                </tr>
            `
              )
              .join("")}
        </tbody>
    </table>

    <div class="summary">
        <h3>Récapitulatif</h3>
        <p><strong>Nombre d'événements:</strong> ${data.summary.totalEvents}</p>
        <p><strong>Total des gains:</strong> ${
          data.summary.totalEarnings
        } DT</p>
        <p><strong>Montant payé:</strong> <span class="paid">${
          data.summary.totalPaid
        } DT</span></p>
        <p><strong>Montant en attente:</strong> <span class="pending">${
          data.summary.totalPending
        } DT</span></p>
    </div>
</body>
</html>`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Générateur de Fiche de Paie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="server">Serveur</Label>
              <Select
                value={selectedServerId}
                onValueChange={setSelectedServerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un serveur" />
                </SelectTrigger>
                <SelectContent>
                  {servers.map((server: Server) => (
                    <SelectItem key={server.id} value={server.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {server.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="month">Mois</Label>
              <Input
                id="month"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
          </div>

          {payrollData && (
            <div className="flex gap-2">
              <Button
                onClick={downloadPayroll}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Télécharger TXT
              </Button>
              <Button
                variant="outline"
                onClick={printPayroll}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Imprimer
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowPayslip(true)}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Fiche de Paie PDF
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {payrollData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Fiche de paie - {payrollData.server.name}
              </div>
              <Badge variant="outline">
                {format(payrollData.period.start, "MMMM yyyy", { locale: fr })}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Résumé */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Événements</p>
                <p className="text-lg font-semibold text-blue-600">
                  {payrollData.summary.totalEvents}
                </p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total gains</p>
                <p className="text-lg font-semibold text-green-600">
                  {payrollData.summary.totalEarnings} DT
                </p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Payé</p>
                <p className="text-lg font-semibold text-purple-600">
                  {payrollData.summary.totalPaid} DT
                </p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-lg font-semibold text-orange-600">
                  {payrollData.summary.totalPending} DT
                </p>
              </div>
            </div>

            <Separator />

            {/* Détail des événements */}
            <div>
              <h4 className="font-semibold mb-3">Détail des événements</h4>
              {payrollData.events.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>Aucun événement pour cette période</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payrollData.events.map((event, index) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {getEventTypeIcon(event.eventType)}
                        </span>
                        <div>
                          <p className="font-medium">{event.clientName}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(event.date, "dd MMMM yyyy", { locale: fr })}{" "}
                            • {event.location}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{event.amountDue} DT</p>
                        <div className="flex items-center gap-2">
                          {event.isPaid ? (
                            <Badge variant="default" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Payé
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              En attente
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {payrollData && showPayslip && (
        <PayslipPreview
          data={convertToPayslipData(payrollData)}
          onClose={() => setShowPayslip(false)}
        />
      )}
    </div>
  );
}
