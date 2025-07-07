import React from "react";
import { useAuth } from "@/hooks/useAuth";
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
  DollarSign,
  LogOut,
  MapPin,
  User,
  Phone,
  Calendar,
  Wallet,
  CreditCard,
  TrendingDown,
  History,
  CheckCircle2,
  XCircle,
  Heart,
  Gift,
  Cake,
  PartyPopper,
  ChefHat,
  Users,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/ui/Logo";
import "@/styles/server-dashboard.css";

const ServerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Récupérer les détails du serveur connecté
  const {
    data: server,
    isLoading: serverLoading,
    isError: serverError,
  } = useQuery({
    queryKey: ["server", user?.serverId],
    queryFn: () => serverService.getServerById(user!.serverId!),
    enabled: !!user?.serverId,
  });

  // Récupérer les événements du serveur
  const {
    data: serverEvents = [],
    isLoading: eventsLoading,
    isError: eventsError,
  } = useQuery({
    queryKey: ["server-events", user?.serverId],
    queryFn: () => eventService.getServerEvents(user!.serverId!),
    enabled: !!user?.serverId,
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user || user.role !== "server") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              Accès non autorisé
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">
              Vous devez être connecté en tant que serveur pour accéder à cette
              page.
            </p>
            <Button onClick={() => navigate("/login")}>
              Retour à la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (serverLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zarzis-primary/10 to-zarzis-primary/20 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zarzis-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Chargement de vos informations...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (serverError || !server) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zarzis-primary/10 to-zarzis-primary/20 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-destructive mb-4">
                Erreur lors du chargement de vos informations
              </p>
              <Button onClick={handleLogout}>Retour à la connexion</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculer les statistiques de paiement
  const totalPaid = server.totalPayments || calculateTotalPaid(server);
  const remainingAmount = server.totalEarnings || 0;
  const originalTotalEarnings =
    server.totalEarningsOriginal || calculateOriginalEarnings(server);
  
  // Calculer l'argent en attente (événements non payés)
  const pendingAmount = serverEvents.reduce((total, event) => {
    const serverAssignment = event.assignedServers?.find(
      (assignment) => assignment.serverId === server.id
    );
    if (serverAssignment && !serverAssignment.isPaid) {
      return total + (serverAssignment.payment || 0);
    }
    return total;
  }, 0);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-zarzis-primary/10 to-zarzis-primary/20">
      {/* Container principal avec padding responsive */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-7xl space-y-4 sm:space-y-6">
        
        {/* Header avec nom du serveur et bouton de déconnexion - Responsive */}
        <Card className="bg-gradient-to-r from-zarzis-primary to-zarzis-primary-dark text-white shadow-xl">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              
              {/* Informations utilisateur */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <Logo 
                    size="md" 
                    variant="white" 
                    showText={false}
                    className="hidden sm:flex"
                  />
                  <div className="p-2 sm:p-3 bg-white/20 rounded-full">
                    <User className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                      Bonjour, {server.name}
                    </h1>
                    <p className="text-zarzis-primary-light/90 text-sm sm:text-base">
                      Votre espace personnel • Waiter of Zarzis
                    </p>
                  </div>
                </div>
              </div>

              {/* Bouton déconnexion - Full width sur mobile */}
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full sm:w-auto bg-white/10 border-white/20 text-white hover:bg-white/20 text-sm sm:text-base"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Se déconnecter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cartes de statistiques principales - Grid responsive amélioré */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          <Card className="bg-gradient-to-br from-zarzis-primary/20 to-zarzis-primary/30 border-zarzis-primary/30 shadow-md hover:shadow-lg transition-all duration-200 card-hover-animation">
            <CardContent className="p-3 sm:p-4 card-mobile">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-zarzis-primary rounded-lg shadow-md">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-white stat-icon" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-zarzis-primary-dark font-medium truncate stat-title">
                    Gains restants
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-zarzis-primary-dark truncate stat-value">
                    {formatCurrency(remainingAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-zarzis-primary/15 to-zarzis-primary/25 border-zarzis-primary/30 shadow-md hover:shadow-lg transition-all duration-200 card-hover-animation">
            <CardContent className="p-3 sm:p-4 card-mobile">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-zarzis-primary-light rounded-lg shadow-md">
                  <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-white stat-icon" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-zarzis-primary-dark font-medium truncate stat-title">
                    Paiements reçus
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-zarzis-primary-dark truncate stat-value">
                    {formatCurrency(totalPaid)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-zarzis-primary/10 to-zarzis-primary/20 border-zarzis-primary/30 shadow-md hover:shadow-lg transition-all duration-200 card-hover-animation">
            <CardContent className="p-3 sm:p-4 card-mobile">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-zarzis-primary-dark rounded-lg shadow-md">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white stat-icon" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-zarzis-primary-dark font-medium truncate stat-title">
                    Événements
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-zarzis-primary-dark truncate">
                    {server.totalEvents}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-md hover:shadow-lg transition-all duration-200 card-hover-animation">
            <CardContent className="p-3 sm:p-4 card-mobile">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-orange-500 rounded-lg shadow-md">
                  <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-white stat-icon" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-orange-700 font-medium truncate stat-title">Statut</p>
                  <Badge
                    variant={server.available ? "default" : "secondary"}
                    className="mt-1 text-xs sm:text-sm"
                  >
                    {server.available ? "Disponible" : "Indisponible"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nouvelle carte : Argent en attente */}
          <Card className="bg-gradient-to-br from-zarzis-primary/5 to-zarzis-primary/15 border-zarzis-primary/30 shadow-md hover:shadow-lg transition-all duration-200 card-hover-animation">
            <CardContent className="p-3 sm:p-4 card-mobile">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-yellow-500 rounded-lg shadow-md">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white stat-icon" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-zarzis-primary-dark font-medium truncate stat-title">
                    En attente
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-zarzis-primary-dark truncate stat-value">
                    {formatCurrency(pendingAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section principale - Grid responsive amélioré */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Informations personnelles */}
          <Card className="hover:shadow-lg transition-shadow duration-200 lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <div className="p-1.5 sm:p-2 bg-zarzis-primary/20 rounded-lg">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-zarzis-primary" />
                </div>
                Mes informations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="space-y-2 sm:space-y-3">
                {/* Info téléphone - Responsive */}
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-zarzis-primary flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Téléphone
                    </p>
                    <p className="font-medium text-sm sm:text-base truncate">
                      {server.phone || "Non renseigné"}
                    </p>
                  </div>
                </div>

                {/* Prix par événement - Responsive */}
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-zarzis-primary flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Prix par événement
                    </p>
                    <p className="font-medium text-sm sm:text-base truncate">
                      {formatCurrency(server.pricePerEvent)}
                    </p>
                  </div>
                </div>

                {/* Statut - Responsive */}
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-zarzis-primary flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Statut
                    </p>
                    <Badge 
                      variant={server.available ? "default" : "secondary"}
                      className="text-xs sm:text-sm"
                    >
                      {server.available ? "Disponible" : "Indisponible"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Historique des paiements - Responsive */}
          <Card className="lg:col-span-2 hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-base sm:text-lg">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 sm:p-2 bg-zarzis-primary/20 rounded-lg">
                    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-zarzis-primary" />
                  </div>
                  <span>Historique des paiements</span>
                </div>
                <Badge variant="outline" className="self-start sm:ml-auto text-xs sm:text-sm">
                  {server.payments?.length || 0} paiements
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!server.payments || server.payments.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <CreditCard className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <p className="text-gray-500 text-sm sm:text-base">Aucun paiement enregistré</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3 max-h-60 sm:max-h-80 overflow-y-auto mobile-scroll">
                  {server.payments
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                    .map((payment, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-2 sm:gap-0"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="p-1.5 sm:p-2 bg-green-100 rounded-full">
                            <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-green-700 text-sm sm:text-base">
                              +{formatCurrency(payment.amount)}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {format(new Date(payment.date), "dd MMM yyyy", {
                                locale: fr,
                              })}
                            </p>
                            {payment.notes && (
                              <p className="text-xs text-gray-500 mt-1 truncate">
                                {payment.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-left sm:text-right flex-shrink-0">
                          <p className="text-xs sm:text-sm text-gray-600">
                            Restant: {formatCurrency(payment.remaining)}
                          </p>
                          {payment.paymentMethod && (
                            <p className="text-xs text-gray-500">
                              {payment.paymentMethod}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Résumé financier - Responsive */}
              <Separator className="my-3 sm:my-4" />
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">
                    Total gagné (original):
                  </span>
                  <span className="font-medium text-sm sm:text-base">
                    {formatCurrency(originalTotalEarnings)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Total reçu:</span>
                  <span className="font-medium text-zarzis-primary text-sm sm:text-base">
                    {formatCurrency(totalPaid)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-base sm:text-lg font-bold">
                  <span>Montant restant:</span>
                  <span
                    className={
                      remainingAmount > 0 ? "text-zarzis-primary" : "text-gray-500"
                    }
                  >
                    {formatCurrency(remainingAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Historique des événements - Responsive */}
        <Card className="hover:shadow-lg transition-shadow duration-200">            <CardHeader className="pb-3">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-base sm:text-lg">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 sm:p-2 bg-zarzis-primary/20 rounded-lg">
                    <History className="h-4 w-4 sm:h-5 sm:w-5 text-zarzis-primary" />
                  </div>
                  <span>Mes événements</span>
                </div>
                <Badge variant="outline" className="self-start sm:ml-auto text-xs sm:text-sm">
                  {eventsLoading
                  ? "Chargement..."
                  : `${serverEvents.length} événements`}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="text-center py-6 sm:py-8">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-purple-600 mx-auto mb-3 sm:mb-4"></div>
                <p className="text-gray-500 text-sm sm:text-base">Chargement de vos événements...</p>
              </div>
            ) : eventsError ? (
              <div className="text-center py-6 sm:py-8">
                <XCircle className="h-8 w-8 sm:h-12 sm:w-12 text-red-300 mx-auto mb-3 sm:mb-4" />
                <p className="text-red-500 text-sm sm:text-base">
                  Erreur lors du chargement des événements
                </p>
              </div>
            ) : serverEvents.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">Aucun événement trouvé</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto mobile-scroll">
                {serverEvents
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  )
                  .map((event) => {
                    const serverAssignment = event.assignedServers?.find(
                      (assignment) => assignment.serverId === server.id
                    );

                    return (
                      <div
                        key={event.id}
                        className="p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow bg-white card-hover-animation"
                      >
                        {/* En-tête événement - Responsive */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            {getEventTypeIcon(event.eventType)}
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-base sm:text-lg truncate">
                                {event.clientName}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {getEventTypeLabel(event.eventType)}
                              </p>
                            </div>
                          </div>
                          <div className="flex sm:flex-col sm:items-end gap-2 sm:gap-1">
                            <Badge
                              variant={
                                serverAssignment?.isPaid
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs sm:text-sm"
                            >
                              {serverAssignment?.isPaid ? "Payé" : "En attente"}
                            </Badge>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {formatCurrency(serverAssignment?.payment || 0)}
                            </p>
                          </div>
                        </div>

                        {/* Détails événement - Grid responsive */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">
                              {format(new Date(event.date), "dd MMM yyyy", {
                                locale: fr,
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ChefHat className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{getCatererLabel(event.caterer)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{event.numberOfServers} serveurs</span>
                          </div>
                        </div>

                        {/* Notes - Responsive */}
                        {event.notes && (
                          <div className="mt-3 p-2 bg-gray-50 rounded text-xs sm:text-sm">
                            <strong>Notes:</strong> <span className="break-words">{event.notes}</span>
                          </div>
                        )}

                        {/* Date de paiement - Responsive */}
                        {serverAssignment?.paymentDate && (
                          <div className="mt-2 text-xs text-green-600">
                            <CheckCircle2 className="h-3 w-3 inline mr-1" />
                            Payé le{" "}
                            {format(
                              new Date(serverAssignment.paymentDate),
                              "dd MMM yyyy",
                              { locale: fr }
                            )}
                            {serverAssignment.paymentMethod &&
                              ` (${serverAssignment.paymentMethod})`}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServerDashboard;
