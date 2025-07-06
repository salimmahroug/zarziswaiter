import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EventDetails } from "@/types";
import { format, isToday, isPast, isFuture } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar,
  DollarSign,
  MapPin,
  User,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Heart,
  Gift,
  Cake,
  PartyPopper,
  ChefHat,
  PiggyBank,
  TrendingUp,
} from "lucide-react";

interface EventDetailProps {
  event: EventDetails;
}

export function EventDetail({ event }: EventDetailProps) {
  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "marriage":
        return "Mariage";
      case "fiancaille":
        return "Fiançailles";
      case "anniversaire":
        return "Anniversaire";
      case "autre":
        return "Autre";
      default:
        return type;
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "marriage":
        return <Heart className="h-4 w-4 text-pink-600" />;
      case "fiancaille":
        return <Gift className="h-4 w-4 text-purple-600" />;
      case "anniversaire":
        return <Cake className="h-4 w-4 text-orange-600" />;
      case "autre":
        return <PartyPopper className="h-4 w-4 text-blue-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCatererLabel = (caterer: string) => {
    switch (caterer) {
      case "chef-souma":
        return "Chef Souma";
      case "ayoub-chaftar":
        return "Ayoub Chaftar";
      case "prive-sans-traiteur":
        return "Privé sans traiteur";
      default:
        return caterer;
    }
  };

  const getEventStatus = () => {
    const eventDate = new Date(event.date);
    if (isToday(eventDate)) {
      return {
        label: "Aujourd'hui",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <Clock className="h-3 w-3" />,
      };
    } else if (isPast(eventDate)) {
      return {
        label: "Terminé",
        color: "bg-gray-100 text-gray-600 border-gray-200",
        icon: <CheckCircle2 className="h-3 w-3" />,
      };
    } else {
      return {
        label: "À venir",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <AlertCircle className="h-3 w-3" />,
      };
    }
  };

  const status = getEventStatus();

  return (
    <div className="h-[600px] overflow-y-auto space-y-4 pr-2">
      {/* En-tête compact */}
      <Card className="border border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                <User className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {event.clientName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {getEventTypeIcon(event.eventType)}
                    {getEventTypeLabel(event.eventType)}
                  </Badge>
                  <Badge className={`text-xs ${status.color}`}>
                    {status.icon}
                    {status.label}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="text-right text-sm">
              <div className="flex items-center gap-1 text-gray-900">
                <Calendar className="h-3 w-3" />
                {format(event.date, "d MMM yyyy", { locale: fr })}
              </div>
              <div className="flex items-center gap-1 text-gray-600 mt-1">
                <MapPin className="h-3 w-3" />
                {event.location}
              </div>
            </div>
          </div>

          {event.caterer && event.caterer !== "prive-sans-traiteur" && (
            <div className="flex items-center gap-2 text-xs text-orange-700 mt-2 pt-2 border-t">
              <ChefHat className="h-3 w-3" />
              Traiteur: {getCatererLabel(event.caterer)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistiques compactes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-xs text-gray-600">Serveurs</p>
              <p className="text-lg font-bold text-gray-900">
                {event.numberOfServers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-xs text-gray-600">Prix/Serveur</p>
              <p className="text-lg font-bold text-gray-900">
                {event.pricePerServer} DT
              </p>
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <div>
              <p className="text-xs text-gray-600">Payé/Serveur</p>
              <p className="text-lg font-bold text-gray-900">
                {event.serverPayAmount} DT
              </p>
            </div>
          </div>
        </div>

        {event.catererPrice && event.catererPrice > 0 && (
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2">
              <ChefHat className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-xs text-gray-600">Prix Traiteur</p>
                <p className="text-lg font-bold text-gray-900">
                  {event.catererPrice} DT
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Résumé financier compact */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <PiggyBank className="h-4 w-4 text-purple-600" />
            Résumé Financier
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-4 pb-4">
          {event.caterer === "prive-sans-traiteur" ? (
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-blue-800">
                      CLIENT PAIE
                    </p>
                    <p className="text-lg font-bold text-blue-700">
                      {event.totalAmount} DT
                    </p>
                  </div>
                  <div className="text-xs text-blue-600">
                    {event.numberOfServers} × {event.pricePerServer} DT
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-xs text-gray-600">Serveurs</p>
                  <p className="text-sm font-bold text-green-600">
                    {event.netAmount} DT
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600">Commission</p>
                  <p className="text-sm font-bold text-purple-600">
                    {event.companyCommission} DT
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-orange-800">
                      TRAITEUR PAIE
                    </p>
                    <p className="text-lg font-bold text-orange-700">
                      {event.totalAmount} DT
                    </p>
                  </div>
                  <div className="text-xs text-orange-600">
                    {event.numberOfServers} × {event.pricePerServer} DT
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-xs text-gray-600">Serveurs</p>
                  <p className="text-sm font-bold text-green-600">
                    {event.netAmount} DT
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600">Bénéfice</p>
                  <p className="text-sm font-bold text-purple-600">
                    {event.companyCommission} DT
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Serveurs assignés compact */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-blue-600" />
            Serveurs ({event.assignedServers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {event.assignedServers.map((server) => (
              <div
                key={server.id}
                className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-md text-sm"
              >
                <User className="h-3 w-3 text-blue-600" />
                {server.name}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notes compactes */}
      {event.notes && (
        <Card className="border border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            <p className="text-sm text-gray-700 bg-amber-50 p-3 rounded border border-amber-200">
              {event.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
