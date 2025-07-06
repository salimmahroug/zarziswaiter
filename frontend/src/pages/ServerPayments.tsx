import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { serverService } from "@/services/serverService";
import { Server } from "@/types";
import { calculateTotalPaid, formatCurrency } from "@/lib/payment-utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CreditCard,
  DollarSign,
  User,
  History,
  Calculator,
  TrendingDown,
  Calendar,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

export default function ServerPayments() {
  const [selectedServerId, setSelectedServerId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentNotes, setPaymentNotes] = useState("");

  const queryClient = useQueryClient();
  const { data: servers = [] } = useQuery<Server[]>({
    queryKey: ["servers"],
    queryFn: () => serverService.getAllServers(),
  });

  const { data: selectedServer } = useQuery<Server>({
    queryKey: ["server", selectedServerId],
    queryFn: () => serverService.getServerById(selectedServerId),
    enabled: !!selectedServerId,
  });

  const paymentMutation = useMutation({
    mutationFn: async (paymentData: {
      amount: number;
      paymentMethod: string;
      notes: string;
    }) => {
      return serverService.addServerPayment(selectedServerId, paymentData);
    },
    onSuccess: (data) => {
      // Invalidate both server list and specific server queries
      queryClient.invalidateQueries({ queryKey: ["servers"] });
      queryClient.invalidateQueries({ queryKey: ["server", selectedServerId] });

      // Force refetch to ensure data is up to date
      queryClient.refetchQueries({ queryKey: ["servers"] });

      console.log("Payment success, server data:", data);
      toast.success("Paiement effectué avec succès !");
      setPaymentAmount("");
      setPaymentNotes("");
    },
    onError: (error: Error) => {
      toast.error("Erreur lors du paiement");
    },
  });

  const handlePayment = () => {
    if (!selectedServerId) {
      toast.error("Veuillez sélectionner un serveur");
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      toast.error("Veuillez saisir un montant valide");
      return;
    }
    if (!selectedServer) {
      toast.error("Impossible de récupérer les informations du serveur");
      return;
    }

    if (amount > selectedServer.totalEarnings) {
      toast.error(
        `Le montant ne peut pas dépasser les gains du serveur (${selectedServer.totalEarnings} DT)`
      );
      return;
    }

    toast.info("Traitement du paiement en cours...");

    paymentMutation.mutate({
      amount,
      paymentMethod,
      notes: paymentNotes,
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "cash":
        return "💵 Espèces";
      case "transfer":
        return "🏦 Virement";
      case "check":
        return "📝 Chèque";
      case "other":
        return "🔗 Autre";
      default:
        return method;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
          <CreditCard className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Paiement Serveurs</h1>
          <p className="text-muted-foreground">
            Gérez les paiements et l'historique des serveurs
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulaire de paiement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Nouveau Paiement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sélection du serveur */}
            <div>
              <Label htmlFor="server">Serveur</Label>
              <Select
                value={selectedServerId}
                onValueChange={setSelectedServerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un serveur" />
                </SelectTrigger>{" "}
                <SelectContent>
                  {servers.map((server: Server) => (
                    <SelectItem key={server.id} value={server.id}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {server.name}
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {server.totalEarnings} DT
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>{" "}
            {/* Informations du serveur sélectionné */}
            {selectedServer && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Informations du serveur
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-blue-600">Nom:</span>{" "}
                    {selectedServer.name}
                  </div>
                  <div>
                    <span className="text-blue-600">Événements:</span>{" "}
                    {selectedServer.totalEvents}
                  </div>
                  {/* Gains originaux calculés */}
                  <div>
                    <span className="text-blue-600">
                      Gains totaux accumulés:
                    </span>{" "}
                    {(
                      selectedServer.totalEarningsOriginal ||
                      (selectedServer.payments?.reduce(
                        (sum, payment) => sum + payment.amount,
                        0
                      ) || 0) + selectedServer.totalEarnings
                    ).toFixed(2)}{" "}
                    DT
                  </div>

                  {/* Total des paiements déjà effectués */}
                  <div>
                    <span className="text-green-600">Déjà payé:</span>{" "}
                    <span className="font-semibold text-green-600">
                      {(
                        selectedServer.payments?.reduce(
                          (sum, payment) => sum + payment.amount,
                          0
                        ) || 0
                      ).toFixed(2)}{" "}
                      DT
                    </span>
                  </div>

                  {/* Montant restant à payer */}
                  <div>
                    <span className="text-orange-600">Reste à payer:</span>{" "}
                    <span className="font-semibold text-orange-600">
                      {selectedServer.totalEarnings.toFixed(2)} DT
                    </span>
                  </div>

                  <div>
                    <span className="text-blue-600">Paiements reçus:</span>{" "}
                    {selectedServer.payments?.length || 0}
                  </div>
                </div>
              </div>
            )}
            {/* Montant à payer */}
            <div>
              <Label htmlFor="amount">Montant à payer (DT)</Label>
              <Input
                id="amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0.00"
                disabled={!selectedServerId}
                max={selectedServer?.totalEarnings || 0}
              />
              {selectedServer && (
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum: {selectedServer.totalEarnings} DT
                </p>
              )}
            </div>
            {/* Méthode de paiement */}
            <div>
              <Label htmlFor="method">Méthode de paiement</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">💵 Espèces</SelectItem>
                  <SelectItem value="transfer">🏦 Virement bancaire</SelectItem>
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
            {/* Bouton de paiement */}
            <Button
              onClick={handlePayment}
              disabled={
                !selectedServerId || !paymentAmount || paymentMutation.isPending
              }
              className="w-full"
              size="lg"
            >
              {paymentMutation.isPending ? (
                "Traitement..."
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Effectuer le paiement
                </>
              )}
            </Button>
          </CardContent>
        </Card>{" "}
        {/* Historique des paiements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Historique des paiements
                {selectedServer ? (
                  <Badge variant="secondary">
                    {selectedServer.payments?.length || 0} paiement(s)
                  </Badge>
                ) : (
                  <Badge variant="outline">Tous les serveurs</Badge>
                )}
              </div>
              {!selectedServerId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Toggle pour afficher tous les paiements
                    window.location.reload();
                  }}
                >
                  Actualiser
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedServerId ? (
              // Afficher tous les paiements de tous les serveurs
              <div className="space-y-4">
                {servers.filter(
                  (server) => server.payments && server.payments.length > 0
                ).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>Aucun paiement effectué par aucun serveur</p>
                  </div>
                ) : (
                  servers
                    .filter(
                      (server) => server.payments && server.payments.length > 0
                    )
                    .map((server) => (
                      <div key={server.id} className="border rounded-lg p-4">
                        <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {server.name}
                          <Badge variant="outline" className="ml-2">
                            {server.payments.length} paiement(s)
                          </Badge>
                        </h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {server.payments
                            .sort(
                              (a, b) =>
                                new Date(b.date).getTime() -
                                new Date(a.date).getTime()
                            )
                            .map((payment, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 bg-gray-25"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                    <span className="font-semibold text-green-600">
                                      {formatCurrency(payment.amount)} DT
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {getPaymentMethodLabel(
                                        payment.paymentMethod
                                      )}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {format(
                                        new Date(payment.date),
                                        "dd/MM/yyyy 'à' HH:mm",
                                        { locale: fr }
                                      )}
                                    </div>
                                    <div>
                                      Restant:{" "}
                                      {formatCurrency(payment.remaining)} DT
                                    </div>
                                  </div>
                                  {payment.notes && (
                                    <p className="text-xs text-muted-foreground mt-1 italic">
                                      "{payment.notes}"
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))
                )}
              </div>
            ) : !selectedServer?.payments?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>Aucun paiement effectué</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedServer.payments
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  )
                  .map((payment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      {" "}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-green-600">
                            {formatCurrency(payment.amount)} DT
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {getPaymentMethodLabel(payment.paymentMethod)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(
                              new Date(payment.date),
                              "dd/MM/yyyy 'à' HH:mm",
                              { locale: fr }
                            )}
                          </div>
                          <div>
                            Restant: {formatCurrency(payment.remaining)} DT
                          </div>
                        </div>
                        {payment.notes && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            "{payment.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Résumé général */}
      {servers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Résumé général</CardTitle>
          </CardHeader>
          <CardContent>
            {" "}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total serveurs</p>
                <p className="text-lg font-semibold text-blue-600">
                  {servers.length}
                </p>
              </div>{" "}
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Total gains restants
                </p>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(
                    servers.reduce(
                      (sum: number, server: Server) =>
                        sum + (server.totalEarnings || 0),
                      0
                    )
                  )}{" "}
                  DT
                </p>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total payé</p>
                <p className="text-lg font-semibold text-emerald-600">
                  {formatCurrency(
                    servers.reduce(
                      (sum: number, server: Server) =>
                        sum + calculateTotalPaid(server),
                      0
                    )
                  )}{" "}
                  DT
                </p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Serveurs actifs</p>
                <p className="text-lg font-semibold text-purple-600">
                  {servers.filter((server: Server) => server.available).length}
                </p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Paiements effectués
                </p>
                <p className="text-lg font-semibold text-orange-600">
                  {servers.reduce(
                    (sum: number, server: Server) =>
                      sum + (server.payments?.length || 0),
                    0
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
