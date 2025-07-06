import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { serverService } from "@/services/serverService";
import { eventService } from "@/services/eventService";
import { PayslipButton } from "@/components/servers/PayslipButton";
import {
  calculateTotalPaid,
  calculateOriginalEarnings,
  formatCurrency,
} from "@/lib/payment-utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  DollarSign,
  Wallet,
  CreditCard,
  TrendingDown,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  MapPin,
  Heart,
  Gift,
  Cake,
  PartyPopper,
  ChefHat,
  Eye,
  Users,
} from "lucide-react";
import { toast } from "sonner";

export default function ServerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: server,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["server", id],
    queryFn: () => serverService.getServerById(id!),
    enabled: !!id,
  });

  // Récupérer les événements du serveur
  const {
    data: serverEvents = [],
    isLoading: eventsLoading,
    isError: eventsError,
  } = useQuery({
    queryKey: ["server-events", id],
    queryFn: () => eventService.getServerEvents(id!),
    enabled: !!id,
  });
  if (isLoading || eventsLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Chargement des détails du serveur...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !server) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-destructive">
              Erreur lors du chargement des détails du serveur
            </p>
            <Button onClick={() => navigate("/servers")} className="mt-4">
              Retour aux serveurs
            </Button>
          </div>
        </div>
      </div>
    );
  } // Calculer les statistiques de paiement en utilisant nos fonctions utilitaires
  // Utiliser les valeurs calculées par le backend si disponibles, sinon calculer à partir des paiements
  const totalPaid = server.totalPayments || calculateTotalPaid(server);
  const remainingAmount = server.totalEarnings || 0;
  const originalTotalEarnings =
    server.totalEarningsOriginal || calculateOriginalEarnings(server);

  console.log("Détail du serveur - Montants:", {
    totalPayments: totalPaid,
    remaining: remainingAmount,
    original: originalTotalEarnings,
  });

  // Fonctions utilitaires pour l'affichage des événements
  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "marriage":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "fiancaille":
        return <Gift className="h-4 w-4 text-pink-500" />;
      case "anniversaire":
        return <Cake className="h-4 w-4 text-blue-500" />;
      default:
        return <PartyPopper className="h-4 w-4 text-purple-500" />;
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "marriage":
        return "Mariage";
      case "fiancaille":
        return "Fiançailles";
      case "anniversaire":
        return "Anniversaire";
      default:
        return "Autre";
    }
  };

  const getCatererLabel = (caterer: string) => {
    switch (caterer) {
      case "chef-souma":
        return "Chef Souma";
      case "ayoub-chaftar":
        return "Ayoub Chaftar";
      case "prive-sans-traiteur":
        return "Privé";
      default:
        return caterer;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "cash":
        return { label: "💵 Espèces", color: "bg-green-100 text-green-800" };
      case "transfer":
        return { label: "🏦 Virement", color: "bg-blue-100 text-blue-800" };
      case "check":
        return { label: "📝 Chèque", color: "bg-purple-100 text-purple-800" };
      case "other":
        return { label: "🔗 Autre", color: "bg-gray-100 text-gray-800" };
      default:
        return { label: method, color: "bg-gray-100 text-gray-800" };
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête avec navigation */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/servers")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{server.name}</h1>
            <p className="text-muted-foreground">Détails complets du serveur</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <PayslipButton 
            server={server} 
            variant="outline" 
            size="sm"
          />
          <Badge
            variant={server.available ? "default" : "destructive"}
            className="text-sm"
          >
            {server.available ? "Disponible" : "Non disponible"}
          </Badge>
        </div>
      </div>{" "}
      {/* Vue d'ensemble - Stats principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-700 font-medium">
                  Gains totaux
                </p>
                <p className="text-xl font-bold text-blue-800">
                  {formatCurrency(originalTotalEarnings)} DT
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-700 font-medium">
                  Argent reçu
                </p>
                <p className="text-xl font-bold text-green-800">
                  {formatCurrency(totalPaid)} DT
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <TrendingDown className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-orange-700 font-medium">
                  Reste à payer
                </p>
                <p className="text-xl font-bold text-orange-800">
                  {formatCurrency(remainingAmount)} DT
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-700 font-medium">
                  Événements
                </p>
                <p className="text-xl font-bold text-purple-800">
                  {server.totalEvents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations personnelles - Améliorées */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Téléphone
                  </p>
                  <p className="font-medium">
                    {server.phone || "Non renseigné"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Expérience
                  </p>
                  <p className="font-medium">
                    {server.totalEvents} événement
                    {server.totalEvents !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <DollarSign className="h-4 w-4 text-amber-500" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Tarif unitaire
                  </p>
                  <p className="font-medium">
                    {formatCurrency(server.pricePerEvent || 0)} DT
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {server.available ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Statut
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {server.available ? "Actif" : "Inactif"}
                    </p>
                    <Badge
                      variant={server.available ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {server.available ? "Disponible" : "Non disponible"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques financières détaillées */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <Wallet className="h-5 w-5 text-green-600" />
              </div>
              Détails financiers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Gains bruts accumulés
                    </span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-blue-700">
                  {formatCurrency(originalTotalEarnings)} DT
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Total avant déduction des paiements
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Montant reçu
                    </span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {formatCurrency(totalPaid)} DT
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Total des paiements effectués
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">
                      Solde restant
                    </span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-orange-700">
                  {formatCurrency(remainingAmount)} DT
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  TotalEarnings: {formatCurrency(server.totalEarnings || 0)} DT
                </p>
              </div>
            </div>
          </CardContent>{" "}
        </Card>

        {/* Résumé des paiements - Amélioré */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <History className="h-5 w-5 text-purple-600" />
              </div>
              Résumé des paiements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">
                    Paiements effectués
                  </span>
                </div>
                <span className="text-lg font-bold text-purple-700">
                  {server.payments?.length || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-800">
                    TotalEarnings actuel
                  </span>
                </div>
                <span className="text-lg font-bold text-indigo-700">
                  {formatCurrency(server.totalEarnings)} DT
                </span>
              </div>
            </div>
            {server.payments && server.payments.length > 0 && (
              <div className="space-y-3">
                <div className="border-t pt-3">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Dernier paiement
                  </p>
                  <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-green-700">
                        {formatCurrency(
                          server.payments[server.payments.length - 1].amount
                        )}{" "}
                        DT
                      </span>
                      <Badge variant="outline" className="text-xs bg-white">
                        {format(
                          new Date(
                            server.payments[server.payments.length - 1].date
                          ),
                          "dd/MM/yyyy",
                          { locale: fr }
                        )}
                      </Badge>
                    </div>
                    <p className="text-xs text-green-600">
                      Méthode:{" "}
                      {
                        getPaymentMethodLabel(
                          server.payments[server.payments.length - 1]
                            .paymentMethod || "cash"
                        ).label
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}{" "}
            <Button
              variant="outline"
              className="w-full mt-4 hover:bg-purple-50"
              onClick={() => navigate("/server-payments")}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Effectuer un paiement
            </Button>
          </CardContent>
        </Card>
      </div>
      {/* Section principale - Historique des paiements détaillé */}
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <History className="h-5 w-5 text-indigo-600" />
              </div>
              <span className="text-xl">Historique des paiements détaillé</span>
            </div>{" "}
            {server.payments && server.payments.length > 3 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/server-payments")}
                className="hover:bg-indigo-50"
              >
                Effectuer un paiement
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!server.payments || server.payments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun paiement effectué
              </h3>
              <p className="text-gray-500 mb-4">
                Ce serveur n'a encore reçu aucun paiement
              </p>
              <Button
                variant="outline"
                onClick={() => navigate("/server-payments")}
                className="hover:bg-blue-50"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Effectuer un paiement
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {server.payments
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .slice(0, 3)
                .map((payment, index) => {
                  const methodInfo = getPaymentMethodLabel(
                    payment.paymentMethod || "cash"
                  );
                  return (
                    <div
                      key={index}
                      className="group p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <DollarSign className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <span className="text-xl font-bold text-green-600">
                                {formatCurrency(payment.amount)} DT
                              </span>
                              <Badge
                                variant="outline"
                                className={`ml-2 text-xs ${methodInfo.color}`}
                              >
                                {methodInfo.label}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              <span>
                                {format(
                                  new Date(payment.date),
                                  "dd/MM/yyyy 'à' HH:mm",
                                  { locale: fr }
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <TrendingDown className="h-3 w-3" />
                              <span>
                                Restant: {formatCurrency(payment.remaining)} DT
                              </span>
                            </div>
                          </div>

                          {/* Détails complets du paiement dans une section pliable */}
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg border text-xs">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div>
                                <span className="font-medium">
                                  ID de paiement:
                                </span>{" "}
                                #{index + 1}
                              </div>
                              <div>
                                <span className="font-medium">Montant:</span>{" "}
                                {formatCurrency(payment.amount)} DT
                              </div>
                              <div>
                                <span className="font-medium">
                                  Date complète:
                                </span>{" "}
                                {format(
                                  new Date(payment.date),
                                  "dd/MM/yyyy HH:mm:ss",
                                  { locale: fr }
                                )}
                              </div>
                              <div>
                                <span className="font-medium">
                                  Solde restant:
                                </span>{" "}
                                {formatCurrency(payment.remaining)} DT
                              </div>
                              <div>
                                <span className="font-medium">
                                  Méthode de paiement:
                                </span>{" "}
                                {methodInfo.label}
                              </div>
                              <div>
                                <span className="font-medium">Notes:</span>{" "}
                                {payment.notes || "Aucune note"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              {server.payments.length > 3 && (
                <div className="text-center pt-4 border-t">
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/server-payments")}
                    className="hover:bg-indigo-50"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Effectuer un nouveau paiement
                  </Button>
                </div>
              )}
            </div>
          )}{" "}
        </CardContent>
      </Card>
      {/* Section Historique des Événements */}
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-xl">Historique des événements</span>
              <Badge variant="outline" className="bg-purple-50">
                {serverEvents.length} événement
                {serverEvents.length !== 1 ? "s" : ""}
              </Badge>
            </div>
            {serverEvents.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-600">
                  Total gagné:{" "}
                  {formatCurrency(
                    serverEvents.reduce(
                      (sum, event) => sum + (event.serverPayAmount || 0),
                      0
                    )
                  )}{" "}
                  DT
                </Badge>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {eventsError ? (
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-destructive">
                Erreur lors du chargement des événements
              </p>
            </div>
          ) : serverEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun événement assigné
              </h3>
              <p className="text-gray-500 mb-4">
                Ce serveur n'est assigné à aucun événement pour le moment
              </p>
              <Button
                variant="outline"
                onClick={() => navigate("/events")}
                className="hover:bg-purple-50"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Voir tous les événements
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Statistiques des événements */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-700 font-medium">
                        Total événements
                      </p>
                      <p className="text-xl font-bold text-blue-800">
                        {serverEvents.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-green-700 font-medium">
                        Revenus événements
                      </p>
                      <p className="text-xl font-bold text-green-800">
                        {formatCurrency(
                          serverEvents.reduce(
                            (sum, event) => sum + (event.serverPayAmount || 0),
                            0
                          )
                        )}{" "}
                        DT
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="text-sm text-amber-700 font-medium">
                        Revenu moyen
                      </p>
                      <p className="text-xl font-bold text-amber-800">
                        {formatCurrency(
                          serverEvents.length > 0
                            ? serverEvents.reduce(
                                (sum, event) =>
                                  sum + (event.serverPayAmount || 0),
                                0
                              ) / serverEvents.length
                            : 0
                        )}{" "}
                        DT
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-purple-700 font-medium">
                        Type principal
                      </p>{" "}
                      <p className="text-lg font-bold text-purple-800">
                        {serverEvents.length > 0
                          ? (() => {
                              const typeCounts = serverEvents.reduce(
                                (acc, event) => {
                                  acc[event.eventType] =
                                    (acc[event.eventType] || 0) + 1;
                                  return acc;
                                },
                                {} as Record<string, number>
                              );
                              const mostCommonType =
                                Object.entries(typeCounts).sort(
                                  ([, a], [, b]) => b - a
                                )[0]?.[0] || "Autre";
                              return getEventTypeLabel(mostCommonType);
                            })()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Liste des événements */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  Liste complète des événements
                </h4>

                <div className="grid gap-4">
                  {serverEvents
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                    .map((event, index) => (
                      <div
                        key={event.id}
                        className="group p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all duration-200 bg-white"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full group-hover:bg-purple-100 transition-colors">
                              {getEventTypeIcon(event.eventType)}
                            </div>
                            <div>
                              <h5 className="font-semibold text-lg text-gray-900">
                                {event.clientName}
                              </h5>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {format(
                                    new Date(event.date),
                                    "dd MMMM yyyy 'à' HH:mm",
                                    { locale: fr }
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs">
                                {getEventTypeLabel(event.eventType)}
                              </Badge>
                            </div>
                            <p className="text-lg font-bold text-green-600">
                              {formatCurrency(event.serverPayAmount || 0)} DT
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">
                              {event.location}
                            </span>
                          </div>

                          {event.caterer &&
                            event.caterer !== "prive-sans-traiteur" && (
                              <div className="flex items-center gap-2">
                                <ChefHat className="h-3 w-3 text-gray-400" />
                                <span className="text-gray-600">
                                  {getCatererLabel(event.caterer)}
                                </span>
                              </div>
                            )}

                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">
                              {event.assignedServers?.length || 0} serveur
                              {event.assignedServers?.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>

                        {event.notes && (
                          <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
                            <strong>Notes:</strong> {event.notes}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Données techniques - Améliorées */}
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
              <span className="text-xl">Données techniques du serveur</span>
            </div>
            <Badge variant="outline" className="bg-gray-50">
              Détails complets
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-xs font-mono overflow-auto max-h-80">
            <pre className="text-gray-700">
              {JSON.stringify(server, null, 2)}
            </pre>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            <p>
              💡 Ces données techniques montrent la structure complète de
              l'objet serveur tel qu'il est stocké dans la base de données.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
