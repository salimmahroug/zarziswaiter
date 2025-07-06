import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { eventService } from "@/services/eventService";
import { serverService } from "@/services/serverService";
import { Server, EventDetails } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CreditCard,
  CheckCircle,
  Calendar,
  DollarSign,
  User,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface ServerPayment {
  serverId: string;
  serverName?: string;
  amountDue: number;
  amountPaid: number;
  isPaid: boolean;
  paymentDate?: Date;
  paymentMethod?: string;
  notes?: string;
}

interface EventWithPayments {
  id: string;
  clientName: string;
  eventType: string;
  date: Date;
  location: string;
  assignedServers: Array<{ id: string; name: string }>;
  serverPayAmount: number;
  serverPayments?: ServerPayment[];
}

interface EventWithServerPayments extends EventDetails {
  serverPayments?: ServerPayment[];
}

export function QuickPayment() {
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedServerId, setSelectedServerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const queryClient = useQueryClient();
  const { data: events = [] } = useQuery({
    queryKey: ["events"],
    queryFn: () => eventService.getAllEvents(),
  });

  const { data: servers = [] } = useQuery({
    queryKey: ["servers"],
    queryFn: () => serverService.getAllServers(),
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async ({
      eventId,
      serverId,
      paymentData,
    }: {
      eventId: string;
      serverId: string;
      paymentData: Partial<ServerPayment>;
    }) => {
      return eventService.updateServerPayment(eventId, serverId, paymentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Paiement effectué avec succès !");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Erreur lors du paiement");
    },
  });

  const resetForm = () => {
    setSelectedEventId("");
    setSelectedServerId("");
    setPaymentMethod("cash");
    setPaymentNotes("");
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

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "cash":
        return "Espèces";
      case "transfer":
        return "Virement bancaire";
      case "check":
        return "Chèque";
      case "other":
        return "Autre";
      default:
        return "Espèces";
    }
  };
  // Trouver l'événement sélectionné
  const selectedEvent = events.find(
    (event: EventWithServerPayments) => event.id === selectedEventId
  );

  // Trouver le serveur sélectionné
  const selectedServer = servers.find(
    (server: Server) => server.id === selectedServerId
  );

  // Calculer le montant à payer automatiquement
  const amountToPay = selectedEvent ? selectedEvent.serverPayAmount : 0;

  // Vérifier si ce serveur est assigné à cet événement
  const isServerAssigned = selectedEvent?.assignedServers?.some(
    (s: { id: string; name: string }) => s.id === selectedServerId
  ); // Vérifier si ce serveur a déjà été payé pour cet événement
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingPayment = (selectedEvent as any)?.serverPayments?.find(
    (p: ServerPayment) => p.serverId === selectedServerId
  );
  const isAlreadyPaid = existingPayment?.isPaid || false;

  const handleQuickPayment = () => {
    if (!selectedEventId || !selectedServerId) {
      toast.error("Veuillez sélectionner un événement et un serveur");
      return;
    }

    if (!isServerAssigned) {
      toast.error("Ce serveur n'est pas assigné à cet événement");
      return;
    }

    if (isAlreadyPaid) {
      toast.error("Ce serveur a déjà été payé pour cet événement");
      return;
    }

    const paymentData: Partial<ServerPayment> = {
      amountPaid: amountToPay,
      isPaid: true,
      paymentDate: new Date(),
      paymentMethod: paymentMethod,
      notes: paymentNotes,
    };

    updatePaymentMutation.mutate({
      eventId: selectedEventId,
      serverId: selectedServerId,
      paymentData,
    });
  }; // Filtrer les événements non payés pour ce serveur
  const availableEvents = events.filter((event: EventWithServerPayments) => {
    if (!selectedServerId) return true;

    const isAssigned = event.assignedServers?.some(
      (s: { id: string; name: string }) => s.id === selectedServerId
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payment = (event as any).serverPayments?.find(
      (p: ServerPayment) => p.serverId === selectedServerId
    );
    const isPaid = payment?.isPaid || false;

    return isAssigned && !isPaid;
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-green-600" />
          Paiement Rapide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sélection du serveur */}
        <div>
          <Label htmlFor="server">Serveur</Label>
          <Select value={selectedServerId} onValueChange={setSelectedServerId}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un serveur" />
            </SelectTrigger>{" "}
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

        {/* Sélection de l'événement */}
        <div>
          <Label htmlFor="event">Événement à payer</Label>
          <Select
            value={selectedEventId}
            onValueChange={setSelectedEventId}
            disabled={!selectedServerId}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  selectedServerId
                    ? "Sélectionner un événement"
                    : "Sélectionnez d'abord un serveur"
                }
              />
            </SelectTrigger>{" "}
            <SelectContent>
              {availableEvents.map((event: EventWithServerPayments) => (
                <SelectItem key={event.id} value={event.id}>
                  <div className="flex items-center gap-2 py-1">
                    <span className="text-lg">
                      {getEventTypeIcon(event.eventType)}
                    </span>
                    <div>
                      <p className="font-medium">{event.clientName}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(event.date), "dd MMM yyyy", {
                          locale: fr,
                        })}
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedServerId && availableEvents.length === 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Aucun événement en attente de paiement pour ce serveur
            </p>
          )}
        </div>

        {/* Affichage du montant automatique */}
        {selectedEvent && selectedServer && isServerAssigned && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-green-800">
                Montant à payer :
              </span>
              <span className="text-2xl font-bold text-green-600">
                {amountToPay} DT
              </span>
            </div>
            <div className="text-sm text-green-700">
              <p>
                <strong>Serveur :</strong> {selectedServer.name}
              </p>
              <p>
                <strong>Événement :</strong> {selectedEvent.clientName}
              </p>
              <p>
                <strong>Date :</strong>{" "}
                {format(new Date(selectedEvent.date), "PPP", { locale: fr })}
              </p>
            </div>
          </div>
        )}

        {/* Messages d'erreur */}
        {selectedEvent && selectedServer && !isServerAssigned && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">
                Serveur non assigné à cet événement
              </span>
            </div>
          </div>
        )}

        {selectedEvent && selectedServer && isAlreadyPaid && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">
                Ce serveur a déjà été payé pour cet événement
              </span>
            </div>
          </div>
        )}

        <Separator />

        {/* Bouton de paiement */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="w-full"
              size="lg"
              disabled={
                !selectedEventId ||
                !selectedServerId ||
                !isServerAssigned ||
                isAlreadyPaid
              }
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Payer {amountToPay} DT
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer le paiement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Récapitulatif */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">
                  Récapitulatif du paiement
                </h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Serveur :</strong> {selectedServer?.name}
                  </p>
                  <p>
                    <strong>Événement :</strong> {selectedEvent?.clientName}
                  </p>
                  <p>
                    <strong>Date :</strong>{" "}
                    {selectedEvent &&
                      format(new Date(selectedEvent.date), "PPP", {
                        locale: fr,
                      })}
                  </p>
                  <p>
                    <strong>Montant :</strong>{" "}
                    <span className="text-lg font-bold text-green-600">
                      {amountToPay} DT
                    </span>
                  </p>
                </div>
              </div>

              {/* Méthode de paiement */}
              <div>
                <Label htmlFor="paymentMethod">Méthode de paiement</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">💵 Espèces</SelectItem>
                    <SelectItem value="transfer">
                      🏦 Virement bancaire
                    </SelectItem>
                    <SelectItem value="check">📝 Chèque</SelectItem>
                    <SelectItem value="other">🔗 Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <Textarea
                  id="notes"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Notes sur le paiement..."
                  rows={2}
                />
              </div>

              {/* Boutons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleQuickPayment}
                  className="flex-1"
                  disabled={updatePaymentMutation.isPending}
                >
                  {updatePaymentMutation.isPending ? (
                    "Traitement..."
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmer le paiement
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
