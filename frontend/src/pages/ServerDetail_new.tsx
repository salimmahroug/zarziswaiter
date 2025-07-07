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
import "@/styles/server-detail.css";

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
      <div className="server-detail-container">
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
      <div className="server-detail-container">
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
  }

  // Calculer les statistiques de paiement en utilisant nos fonctions utilitaires
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
    <div className="server-detail-container">
      {/* En-tête avec navigation responsive */}
      <div className="server-detail-header">
        <div className="header-content">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/servers")}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full shrink-0">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="responsive-title">{server.name}</h1>
              <p className="text-muted-foreground text-sm sm:text-base">Détails complets du serveur</p>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <div className="action-buttons">
            <PayslipButton 
              server={server} 
              variant="outline" 
              size="sm"
            />
            <Badge
              variant={server.available ? "default" : "destructive"}
              className="badge-responsive"
            >
              {server.available ? "Disponible" : "Non disponible"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Vue d'ensemble - Stats principales responsive */}
      <div className="stats-grid">
        <Card className="detail-card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg shrink-0">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-blue-700 font-medium">
                  Gains totaux
                </p>
                <p className="text-lg sm:text-xl font-bold text-blue-800 truncate">
                  {formatCurrency(originalTotalEarnings)} DT
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="detail-card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg shrink-0">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-green-700 font-medium">
                  Argent reçu
                </p>
                <p className="text-lg sm:text-xl font-bold text-green-800 truncate">
                  {formatCurrency(totalPaid)} DT
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="detail-card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg shrink-0">
                <TrendingDown className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-orange-700 font-medium">
                  Reste à payer
                </p>
                <p className="text-lg sm:text-xl font-bold text-orange-800 truncate">
                  {formatCurrency(remainingAmount)} DT
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="detail-card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg shrink-0">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-purple-700 font-medium">
                  Événements
                </p>
                <p className="text-lg sm:text-xl font-bold text-purple-800">
                  {server.totalEvents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Layout principal responsive */}
      <div className="main-layout">
        {/* Informations personnelles - Améliorées et responsives */}
        <Card className="detail-card hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 responsive-subtitle">
              <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <span className="truncate">Informations personnelles</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="info-grid">
              <div className="info-item">
                <Phone className="h-4 w-4 text-blue-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Téléphone
                  </p>
                  <p className="font-medium truncate">
                    {server.phone || "Non renseigné"}
                  </p>
                </div>
              </div>

              <div className="info-item">
                <Calendar className="h-4 w-4 text-green-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Expérience
                  </p>
                  <p className="font-medium">
                    {server.totalEvents} événement
                    {server.totalEvents !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="info-item">
                <DollarSign className="h-4 w-4 text-amber-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Tarif unitaire
                  </p>
                  <p className="font-medium truncate">
                    {formatCurrency(server.pricePerEvent || 0)} DT
                  </p>
                </div>
              </div>

              <div className="info-item">
                {server.available ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Statut
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">
                      {server.available ? "Actif" : "Inactif"}
                    </p>
                    <Badge
                      variant={server.available ? "default" : "destructive"}
                      className="badge-responsive"
                    >
                      {server.available ? "Disponible" : "Non disponible"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques financières détaillées - Responsive */}
        <Card className="detail-card hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 responsive-subtitle">
              <div className="p-2 bg-green-100 rounded-lg shrink-0">
                <Wallet className="h-5 w-5 text-green-600" />
              </div>
              <span className="truncate">Détails financiers</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="financial-stats">
              <div className="financial-card bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Wallet className="h-4 w-4 text-blue-600 shrink-0" />
                    <span className="text-sm font-medium text-blue-800 truncate">
                      Gains bruts accumulés
                    </span>
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-blue-700 truncate">
                  {formatCurrency(originalTotalEarnings)} DT
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Total avant déduction des paiements
                </p>
              </div>

              <div className="financial-card bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <CreditCard className="h-4 w-4 text-green-600 shrink-0" />
                    <span className="text-sm font-medium text-green-800 truncate">
                      Montant reçu
                    </span>
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-green-700 truncate">
                  {formatCurrency(totalPaid)} DT
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Total des paiements effectués
                </p>
              </div>

              <div className="financial-card bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <TrendingDown className="h-4 w-4 text-orange-600 shrink-0" />
                    <span className="text-sm font-medium text-orange-800 truncate">
                      Solde restant
                    </span>
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-orange-700 truncate">
                  {formatCurrency(remainingAmount)} DT
                </p>
                <p className="text-xs text-orange-600 mt-1 truncate">
                  TotalEarnings: {formatCurrency(server.totalEarnings || 0)} DT
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Résumé des paiements - Amélioré et responsive */}
        <Card className="detail-card hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 responsive-subtitle">
              <div className="p-2 bg-purple-100 rounded-lg shrink-0">
                <History className="h-5 w-5 text-purple-600" />
              </div>
              <span className="truncate">Résumé des paiements</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <History className="h-4 w-4 text-purple-600 shrink-0" />
                  <span className="text-sm font-medium text-purple-800 truncate">
                    Paiements effectués
                  </span>
                </div>
                <span className="text-lg font-bold text-purple-700 shrink-0">
                  {server.payments?.length || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Wallet className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span className="text-sm font-medium text-indigo-800 truncate">
                    TotalEarnings actuel
                  </span>
                </div>
                <span className="text-lg font-bold text-indigo-700 shrink-0 truncate">
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
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <span className="font-medium text-green-700 truncate">
                        {formatCurrency(
                          server.payments[server.payments.length - 1].amount
                        )}{" "}
                        DT
                      </span>
                      <Badge variant="outline" className="text-xs bg-white shrink-0">
                        {format(
                          new Date(
                            server.payments[server.payments.length - 1].date
                          ),
                          "dd/MM/yyyy",
                          { locale: fr }
                        )}
                      </Badge>
                    </div>
                    <p className="text-xs text-green-600 truncate">
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
            )}
            
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
      <Card className="detail-card hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-2 bg-indigo-100 rounded-lg shrink-0">
                <History className="h-5 w-5 text-indigo-600" />
              </div>
              <span className="responsive-subtitle truncate">Historique des paiements détaillé</span>
            </div>
            {server.payments && server.payments.length > 3 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/server-payments")}
                className="hover:bg-indigo-50 shrink-0"
              >
                Effectuer un paiement
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!server.payments || server.payments.length === 0 ? (
            <div className="empty-state">
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
            <div className="payment-history">
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
                      className="payment-item"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-green-100 rounded-lg shrink-0">
                              <DollarSign className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-lg sm:text-xl font-bold text-green-600">
                                {formatCurrency(payment.amount)} DT
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-xs ${methodInfo.color}`}
                              >
                                {methodInfo.label}
                              </Badge>
                            </div>
                          </div>

                          <div className="payment-details text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 shrink-0" />
                              <span className="truncate">
                                {format(
                                  new Date(payment.date),
                                  "dd/MM/yyyy 'à' HH:mm",
                                  { locale: fr }
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <TrendingDown className="h-3 w-3 shrink-0" />
                              <span className="truncate">
                                Restant: {formatCurrency(payment.remaining)} DT
                              </span>
                            </div>
                          </div>

                          {/* Détails complets du paiement dans une section pliable */}
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg border text-xs scroll-container">
                            <div className="payment-details">
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
          )}
        </CardContent>
      </Card>

      {/* Section Historique des Événements */}
      <Card className="detail-card hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-2 bg-purple-100 rounded-lg shrink-0">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <span className="responsive-subtitle">Historique des événements</span>
              <Badge variant="outline" className="bg-purple-50 shrink-0">
                {serverEvents.length} événement
                {serverEvents.length !== 1 ? "s" : ""}
              </Badge>
            </div>
            {serverEvents.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-600 badge-responsive">
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
            <div className="empty-state">
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
              <div className="events-stats-grid">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-blue-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-blue-700 font-medium">
                        Total événements
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-blue-800">
                        {serverEvents.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-green-700 font-medium">
                        Revenus événements
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-green-800 truncate">
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
                    <TrendingDown className="h-5 w-5 text-amber-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-amber-700 font-medium">
                        Revenu moyen
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-amber-800 truncate">
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
                    <Heart className="h-5 w-5 text-purple-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-purple-700 font-medium">
                        Type principal
                      </p>
                      <p className="text-lg font-bold text-purple-800 truncate">
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
                <h4 className="responsive-subtitle flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  Liste complète des événements
                </h4>

                <div className="events-list">
                  {serverEvents
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                    .map((event, index) => (
                      <div
                        key={event.id}
                        className="event-item"
                      >
                        <div className="event-header">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full group-hover:bg-purple-100 transition-colors shrink-0">
                              {getEventTypeIcon(event.eventType)}
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-semibold text-lg text-gray-900 truncate">
                                {event.clientName}
                              </h5>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="h-3 w-3 shrink-0" />
                                <span className="truncate">
                                  {format(
                                    new Date(event.date),
                                    "dd MMMM yyyy 'à' HH:mm",
                                    { locale: fr }
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="flex items-center gap-2 mb-1 justify-end">
                              <Badge variant="secondary" className="text-xs">
                                {getEventTypeLabel(event.eventType)}
                              </Badge>
                            </div>
                            <p className="text-lg font-bold text-green-600">
                              {formatCurrency(event.serverPayAmount || 0)} DT
                            </p>
                          </div>
                        </div>

                        <div className="event-info">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
                            <span className="text-gray-600 truncate">
                              {event.location}
                            </span>
                          </div>

                          {event.caterer &&
                            event.caterer !== "prive-sans-traiteur" && (
                              <div className="flex items-center gap-2">
                                <ChefHat className="h-3 w-3 text-gray-400 shrink-0" />
                                <span className="text-gray-600 truncate">
                                  {getCatererLabel(event.caterer)}
                                </span>
                              </div>
                            )}

                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3 text-gray-400 shrink-0" />
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

      {/* Données techniques - Améliorées et responsives */}
      <Card className="detail-card hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-2 bg-gray-100 rounded-lg shrink-0">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
              <span className="responsive-subtitle truncate">Données techniques du serveur</span>
            </div>
            <Badge variant="outline" className="bg-gray-50 shrink-0">
              Détails complets
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="technical-data">
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
