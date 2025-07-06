import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { eventService } from "@/services/eventService";
import { CatererType, EventDetails } from "@/types";
import {
  ChefHat,
  DollarSign,
  Calendar,
  TrendingUp,
  PiggyBank,
} from "lucide-react";

interface CatererStatsData {
  caterer: string;
  totalEvents: number;
  totalRevenue: number;
  averageEventPrice: number;
  totalCommission: number;
  events: EventDetails[];
}

export function CatererStats() {
  const [selectedCaterer, setSelectedCaterer] =
    useState<CatererType>("chef-souma");
  const [stats, setStats] = useState<CatererStatsData | null>(null);
  const [loading, setLoading] = useState(false);

  const catererOptions = [
    { value: "chef-souma", label: "Chef Souma", icon: "👨‍🍳" },
    { value: "ayoub-chaftar", label: "Ayoub Chaftar", icon: "🍽️" },
    { value: "prive-sans-traiteur", label: "Privé sans traiteur", icon: "🏠" },
  ];

  const fetchCatererStats = async (caterer: CatererType) => {
    setLoading(true);
    try {
      const data = await eventService.getEventsByCaterer(caterer);
      setStats(data);
    } catch (error) {
      console.error("Error fetching caterer stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatererStats(selectedCaterer);
  }, [selectedCaterer]);
  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return "0.00 DT";
    }
    return `${amount.toFixed(2)} DT`;
  };

  const getCatererIcon = (caterer: string) => {
    const option = catererOptions.find((opt) => opt.value === caterer);
    return option?.icon || "🍽️";
  };

  const getCatererLabel = (caterer: string) => {
    const option = catererOptions.find((opt) => opt.value === caterer);
    return option?.label || caterer;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ChefHat className="h-6 w-6 text-zarzis-blue" />
          Statistiques des Traiteurs
        </h2>
        <Select
          value={selectedCaterer}
          onValueChange={(value: CatererType) => setSelectedCaterer(value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sélectionner un traiteur" />
          </SelectTrigger>
          <SelectContent>
            {catererOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zarzis-blue mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">
              Chargement des statistiques...
            </p>
          </div>
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              {" "}
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Traiteur</CardTitle>
                <span className="text-2xl">
                  {getCatererIcon(stats?.caterer || selectedCaterer)}
                </span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getCatererLabel(stats?.caterer || selectedCaterer)}
                </div>
                <Badge variant="outline" className="mt-1">
                  {stats?.caterer || selectedCaterer}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Événements
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>{" "}
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalEvents || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  événements réalisés
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Revenus Total
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>{" "}
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats?.totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground">revenus cumulés</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Prix Moyen
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>{" "}
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats?.averageEventPrice)}
                </div>
                <p className="text-xs text-muted-foreground">par événement</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Ma Commission
                </CardTitle>
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats?.totalCommission)}
                </div>
                <p className="text-xs text-muted-foreground">
                  commission totale
                </p>
              </CardContent>
            </Card>
          </div>{" "}
          {stats?.events && stats.events.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Événements Récents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {" "}
                  {stats.events
                    .slice(0, 5)
                    .map((event: EventDetails, index: number) => (
                      <div
                        key={event.id || index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{event.clientName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {event.date.toLocaleDateString("fr-FR", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {event.location}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{event.eventType}</Badge>
                          {event.catererPrice && event.catererPrice > 0 && (
                            <p className="text-sm font-medium mt-1">
                              {formatCurrency(event.catererPrice)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}{" "}
                </div>
                {(stats?.events?.length || 0) > 5 && (
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    ... et {(stats?.events?.length || 0) - 5} autres événements
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune donnée disponible pour ce traiteur</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
