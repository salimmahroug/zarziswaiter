import React from 'react';
import { useAuth } from '@/hooks/useAuth';
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
} from "lucide-react";
import { useNavigate } from 'react-router-dom';

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
    navigate('/login');
  };

  if (!user || user.role !== 'server') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Accès non autorisé</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">Vous devez être connecté en tant que serveur pour accéder à cette page.</p>
            <Button onClick={() => navigate('/login')}>
              Retour à la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (serverLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-destructive mb-4">
                Erreur lors du chargement de vos informations
              </p>
              <Button onClick={handleLogout}>
                Retour à la connexion
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculer les statistiques de paiement
  const totalPaid = server.totalPayments || calculateTotalPaid(server);
  const remainingAmount = server.totalEarnings || 0;
  const originalTotalEarnings = server.totalEarningsOriginal || calculateOriginalEarnings(server);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header avec nom du serveur et bouton de déconnexion */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">
                    Bonjour, {server.name}
                  </h1>
                  <p className="text-blue-100">Votre espace personnel</p>
                </div>
              </div>
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Se déconnecter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cartes de statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-700 font-medium">Gains restants</p>
                  <p className="text-xl font-bold text-green-800">
                    {formatCurrency(remainingAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-700 font-medium">Paiements reçus</p>
                  <p className="text-xl font-bold text-blue-800">
                    {formatCurrency(totalPaid)}
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
                  <p className="text-sm text-purple-700 font-medium">Événements</p>
                  <p className="text-xl font-bold text-purple-800">
                    {server.totalEvents}
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
                  <p className="text-sm text-orange-700 font-medium">Statut</p>
                  <Badge variant={server.available ? "default" : "secondary"} className="mt-1">
                    {server.available ? "Disponible" : "Indisponible"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations personnelles */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                Mes informations
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
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Prix par événement
                    </p>
                    <p className="font-medium">
                      {formatCurrency(server.pricePerEvent)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Statut
                    </p>
                    <Badge variant={server.available ? "default" : "secondary"}>
                      {server.available ? "Disponible" : "Indisponible"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Historique des paiements */}
          <Card className="lg:col-span-2 hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
                Historique des paiements
                <Badge variant="outline" className="ml-auto">
                  {server.payments?.length || 0} paiements
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!server.payments || server.payments.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun paiement enregistré</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {server.payments
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((payment, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-full">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-green-700">
                              +{formatCurrency(payment.amount)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(payment.date), "dd MMM yyyy", { locale: fr })}
                            </p>
                            {payment.notes && (
                              <p className="text-xs text-gray-500 mt-1">{payment.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            Restant: {formatCurrency(payment.remaining)}
                          </p>
                          {payment.paymentMethod && (
                            <p className="text-xs text-gray-500">{payment.paymentMethod}</p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
              
              {/* Résumé financier */}
              <Separator className="my-4" />
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total gagné (original):</span>
                  <span className="font-medium">{formatCurrency(originalTotalEarnings)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total reçu:</span>
                  <span className="font-medium text-green-600">{formatCurrency(totalPaid)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Montant restant:</span>
                  <span className={remainingAmount > 0 ? "text-blue-600" : "text-gray-500"}>
                    {formatCurrency(remainingAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Historique des événements */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <History className="h-5 w-5 text-purple-600" />
              </div>
              Mes événements
              <Badge variant="outline" className="ml-auto">
                {eventsLoading ? "Chargement..." : `${serverEvents.length} événements`}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Chargement de vos événements...</p>
              </div>
            ) : eventsError ? (
              <div className="text-center py-8">
                <XCircle className="h-12 w-12 text-red-300 mx-auto mb-4" />
                <p className="text-red-500">Erreur lors du chargement des événements</p>
              </div>
            ) : serverEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucun événement trouvé</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {serverEvents
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((event) => {
                    const serverAssignment = event.assignedServers?.find(
                      assignment => assignment.serverId === server.id
                    );
                    
                    return (
                      <div key={event.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {getEventTypeIcon(event.eventType)}
                            <div>
                              <h3 className="font-semibold text-lg">{event.clientName}</h3>
                              <p className="text-sm text-gray-600">{getEventTypeLabel(event.eventType)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={serverAssignment?.isPaid ? "default" : "secondary"}>
                              {serverAssignment?.isPaid ? "Payé" : "En attente"}
                            </Badge>
                            <p className="text-sm text-gray-600 mt-1">
                              {formatCurrency(serverAssignment?.payment || 0)}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{format(new Date(event.date), "dd MMM yyyy", { locale: fr })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ChefHat className="h-4 w-4 text-gray-400" />
                            <span>{getCatererLabel(event.caterer)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{event.numberOfServers} serveurs</span>
                          </div>
                        </div>

                        {event.notes && (
                          <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                            <strong>Notes:</strong> {event.notes}
                          </div>
                        )}

                        {serverAssignment?.paymentDate && (
                          <div className="mt-2 text-xs text-green-600">
                            <CheckCircle2 className="h-3 w-3 inline mr-1" />
                            Payé le {format(new Date(serverAssignment.paymentDate), "dd MMM yyyy", { locale: fr })}
                            {serverAssignment.paymentMethod && ` (${serverAssignment.paymentMethod})`}
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
