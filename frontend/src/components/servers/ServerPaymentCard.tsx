import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CheckCircle,
  Clock,
  DollarSign,
  CreditCard,
  User,
  FileText,
  Calendar,
  MapPin,
} from "lucide-react";

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

interface EventDetails {
  id: string;
  clientName: string;
  eventType: string;
  date: Date;
  location: string;
  serverPayments?: ServerPayment[];
}

interface ServerPaymentCardProps {
  event: EventDetails;
  onPaymentUpdate: (
    eventId: string,
    serverId: string,
    paymentData: Partial<ServerPayment>
  ) => void;
}

export function ServerPaymentCard({
  event,
  onPaymentUpdate,
}: ServerPaymentCardProps) {
  const [selectedPayment, setSelectedPayment] = useState<ServerPayment | null>(
    null
  );
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

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

  const handleMarkAsPaid = () => {
    if (!selectedPayment) return;

    const amount = parseFloat(paymentAmount) || selectedPayment.amountDue;
    const paymentData: Partial<ServerPayment> = {
      amountPaid: amount,
      isPaid: amount >= selectedPayment.amountDue,
      paymentDate: new Date(),
      paymentMethod: paymentMethod || "cash",
      notes: paymentNotes,
    };

    onPaymentUpdate(event.id, selectedPayment.serverId, paymentData);
    setSelectedPayment(null);
    setPaymentAmount("");
    setPaymentMethod("");
    setPaymentNotes("");
  };
  const totalDue =
    event.serverPayments?.reduce(
      (sum, payment) => sum + payment.amountDue,
      0
    ) || 0;
  const totalPaid =
    event.serverPayments?.reduce(
      (sum, payment) => sum + payment.amountPaid,
      0
    ) || 0;
  const allPaid =
    event.serverPayments?.every((payment) => payment.isPaid) || false;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="text-2xl">
              {getEventTypeIcon(event.eventType)}
            </span>
            <div>
              <h3 className="font-semibold">{event.clientName}</h3>
              <p className="text-sm text-muted-foreground font-normal">
                {format(event.date, "PPP", { locale: fr })}
              </p>
            </div>
          </CardTitle>
          <Badge
            variant={allPaid ? "default" : "secondary"}
            className="flex items-center gap-1"
          >
            {allPaid ? (
              <>
                <CheckCircle className="h-3 w-3" />
                Payé
              </>
            ) : (
              <>
                <Clock className="h-3 w-3" />
                En attente
              </>
            )}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {event.location}
          </div>{" "}
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {event.serverPayments?.length || 0} serveur(s)
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Résumé financier */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total dû</p>
            <p className="font-semibold text-blue-600">{totalDue} DT</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Payé</p>
            <p className="font-semibold text-green-600">{totalPaid} DT</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Restant</p>
            <p className="font-semibold text-orange-600">
              {totalDue - totalPaid} DT
            </p>
          </div>
        </div>{" "}
        {/* Liste des paiements par serveur */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Paiements par serveur</h4>
          {event.serverPayments?.map((payment, index) => (
            <div
              key={payment.serverId}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {payment.serverName || `Serveur ${index + 1}`}
                  </p>
                  <Badge
                    variant={payment.isPaid ? "default" : "outline"}
                    className="text-xs"
                  >
                    {payment.isPaid ? "Payé" : "En attente"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span>Dû: {payment.amountDue} DT</span>
                  {payment.isPaid && payment.paymentDate && (
                    <>
                      <span>•</span>
                      <span>
                        Payé le {format(payment.paymentDate, "dd/MM/yyyy")}
                      </span>
                      <span>•</span>
                      <span>
                        {getPaymentMethodLabel(payment.paymentMethod)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {!payment.isPaid && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedPayment(payment);
                        setPaymentAmount(payment.amountDue.toString());
                      }}
                    >
                      <CreditCard className="h-4 w-4 mr-1" />
                      Payer
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Marquer comme payé</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="paymentAmount">Montant payé (DT)</Label>
                        <Input
                          id="paymentAmount"
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          placeholder="Montant"
                        />
                      </div>

                      <div>
                        <Label htmlFor="paymentMethod">
                          Méthode de paiement
                        </Label>
                        <Select
                          value={paymentMethod}
                          onValueChange={setPaymentMethod}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une méthode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Espèces</SelectItem>
                            <SelectItem value="transfer">
                              Virement bancaire
                            </SelectItem>
                            <SelectItem value="check">Chèque</SelectItem>
                            <SelectItem value="other">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="paymentNotes">Notes (optionnel)</Label>
                        <Textarea
                          id="paymentNotes"
                          value={paymentNotes}
                          onChange={(e) => setPaymentNotes(e.target.value)}
                          placeholder="Notes sur le paiement..."
                          rows={2}
                        />
                      </div>

                      <Button onClick={handleMarkAsPaid} className="w-full">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirmer le paiement
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {payment.isPaid && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {payment.amountPaid} DT
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
