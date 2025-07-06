import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Server, EventDetails } from "@/types";
import { eventService } from "@/services/eventService";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar,
  DollarSign,
  MapPin,
  Heart,
  Gift,
  Cake,
  PartyPopper,
  Users,
  TrendingUp,
  Clock,
  ChefHat,
  CheckCircle,
} from "lucide-react";

interface ServerEventsCardProps {
  server: Server;
}

export function ServerEventsCard({ server }: ServerEventsCardProps) {
  const {
    data: eventsData = { events: [], summary: null },
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["server-events-with-payments", server.id],
    queryFn: async () => {
      // Récupérer les événements du serveur
      const serverEvents = await eventService.getServerEvents(server.id);
      let paymentSummary = null;

      // Récupérer également les détails de paiement
      try {
        paymentSummary = await eventService.getServerPaymentSummary(server.id);
        console.log("Payment summary:", paymentSummary);
      } catch (error) {
        console.error("Error fetching payment summary:", error);
      }

      // Enrichir chaque événement avec ses informations de paiement
      const eventsWithPayments = serverEvents.map((event) => {
        // Chercher les paiements correspondants pour cet événement en utilisant les notes
        // qui peuvent contenir l'ID de l'événement ou le nom du client
        const payment = server.payments.find(
          (p) =>
            p.notes &&
            (p.notes.includes(event.id) || p.notes.includes(event.clientName))
        );

        return {
          ...event,
          payment: payment || null,
          isPaid: !!payment,
          amountPaid: payment ? payment.amount : 0,
        };
      });

      return {
        events: eventsWithPayments,
        summary: paymentSummary,
      };
    },
  });

  const events = eventsData.events;

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

  const totalEarnings = events.reduce(
    (sum, event) => sum + event.serverPayAmount,
    0
  );
  // Calculer les statistiques de paiement à partir des données enrichies
  const paymentStats = events.reduce(
    (stats, event) => {
      const amountDue = event.serverPayAmount || 0;
      const amountPaid = event.amountPaid || 0; // Utilise la propriété amountPaid que nous avons ajoutée
      const isPaid = event.isPaid || false; // Utilise la propriété isPaid que nous avons ajoutée

      stats.totalDue += amountDue;
      stats.totalPaid += amountPaid;
      if (isPaid) stats.paidEvents++;

      return stats;
    },
    { totalDue: 0, totalPaid: 0, paidEvents: 0 }
  );

  // Utiliser le résumé des paiements du backend si disponible
  const summaryStats = eventsData.summary;

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            {server.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-gray-500">Chargement...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="w-full border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-red-600" />
            {server.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 text-sm">
            Erreur lors du chargement des événements
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
              <Users className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold">{server.name}</span>
          </div>
          <Badge variant={server.available ? "default" : "destructive"}>
            {server.available ? "Disponible" : "Indisponible"}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {" "}
        {/* Statistiques résumées avec paiements */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <div className="bg-blue-50 p-2 sm:p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Événements</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900">
                  {events.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-2 sm:p-3 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Total dû</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900">
                  {paymentStats.totalDue} DT
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-2 sm:p-3 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-xs text-gray-600">Payé</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900">
                  {paymentStats.totalPaid} DT
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-2 sm:p-3 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-xs text-gray-600">En attente</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900">
                  {paymentStats.totalDue - paymentStats.totalPaid} DT
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Barre de progression des paiements */}
        <div className="bg-gray-100 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Progression des paiements
            </span>
            <span className="text-sm text-gray-600">
              {paymentStats.paidEvents}/{events.length} événements payés
            </span>
          </div>{" "}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  events.length > 0 && paymentStats.totalDue > 0
                    ? Math.min(
                        (paymentStats.totalPaid / paymentStats.totalDue) * 100,
                        100
                      )
                    : 0
                }%`,
              }}
            ></div>
          </div>{" "}
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>
              {Math.round(
                events.length > 0 && paymentStats.totalDue > 0
                  ? Math.min(
                      (paymentStats.totalPaid / paymentStats.totalDue) * 100,
                      100
                    )
                  : 0
              )}
              % payé
            </span>
            <span>
              {summaryStats?.totalPending !== undefined
                ? summaryStats.totalPending
                : Math.max(
                    paymentStats.totalDue - paymentStats.totalPaid,
                    0
                  )}{" "}
              DT restant
            </span>
          </div>
        </div>
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">Aucun événement assigné</p>
          </div>
        ) : (
          <>
            <Separator />

            {/* Liste des événements récents */}
            <div>
              <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Événements récents ({Math.min(events.length, 3)})
              </h4>{" "}
              <div className="space-y-3">
                {events.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      {getEventTypeIcon(event.eventType)}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between sm:justify-start">
                          <p className="font-medium text-sm truncate mr-2">
                            {event.clientName}
                          </p>
                          <Badge
                            variant="secondary"
                            className="text-xs sm:hidden"
                          >
                            {getEventTypeLabel(event.eventType)}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs text-gray-500 mt-1">
                          <span>
                            {format(event.date, "dd MMM", { locale: fr })}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate max-w-[100px] sm:max-w-none">
                              {event.location}
                            </span>
                          </span>
                          {event.caterer !== "prive-sans-traiteur" && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <div className="flex items-center gap-1">
                                <ChefHat className="h-3 w-3" />
                                <span className="truncate max-w-[100px] sm:max-w-none">
                                  {getCatererLabel(event.caterer)}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center sm:flex-col sm:items-end mt-2 sm:mt-0">
                      <p className="font-semibold text-sm text-green-600">
                        {event.serverPayAmount} DT
                      </p>
                      <div className="flex flex-row sm:flex-col gap-1">
                        <Badge
                          variant="secondary"
                          className="text-xs hidden sm:inline-flex"
                        >
                          {getEventTypeLabel(event.eventType)}
                        </Badge>
                        {/* Afficher le badge de statut de paiement */}
                        {event.isPaid ? (
                          <Badge
                            variant="outline"
                            className="text-xs bg-green-50 text-green-700 border-green-300"
                          >
                            <span className="hidden sm:inline">Payé </span>
                            {event.amountPaid} DT
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-xs bg-orange-50 text-orange-700 border-orange-300"
                          >
                            En attente
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {events.length > 3 && (
                  <p className="text-center text-xs text-gray-500 mt-2">
                    ... et {events.length - 3} autres événements
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
