import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, DollarSign, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { EventDetails, EventType } from "@/types";
import { Badge } from "@/components/ui/badge";
import { eventService } from "@/services/eventService";

const Finances = () => {
  const [period, setPeriod] = useState<"all" | "month" | "quarter">("all");
  const [eventType, setEventType] = useState<EventType | "all">("all");
  const [events, setEvents] = useState<EventDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventService.getAllEvents();
        setEvents(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching events:", error);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    const filterEvents = (events: EventDetails[]) => {
      let filtered = [...events];

      // Filter by period
      if (period === "month") {
        const now = new Date();
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        filtered = filtered.filter((event) => new Date(event.date) >= monthAgo);
      } else if (period === "quarter") {
        const now = new Date();
        const quarterAgo = new Date();
        quarterAgo.setMonth(now.getMonth() - 3);
        filtered = filtered.filter(
          (event) => new Date(event.date) >= quarterAgo
        );
      }

      // Filter by event type
      if (eventType !== "all") {
        filtered = filtered.filter((event) => event.eventType === eventType);
      }

      return filtered;
    };

    return filterEvents(events);
  }, [events, period, eventType]);

  const totalRevenue = useMemo(
    () => filteredEvents.reduce((sum, event) => sum + event.totalAmount, 0),
    [filteredEvents]
  );

  const totalCommission = useMemo(
    () =>
      filteredEvents.reduce((sum, event) => sum + event.companyCommission, 0),
    [filteredEvents]
  );

  const totalNetAmount = useMemo(
    () =>
      filteredEvents.reduce(
        (sum, event) => sum + (event.totalAmount - event.companyCommission),
        0
      ),
    [filteredEvents]
  );

  const chartData = useMemo(() => {
    const monthlyData: { name: string; revenue: number; commission: number }[] =
      [];
    const months: Record<string, { revenue: number; commission: number }> = {};

    filteredEvents.forEach((event) => {
      const date = new Date(event.date);
      const monthYear = format(date, "MMM yy", { locale: fr });
      if (!months[monthYear]) {
        months[monthYear] = { revenue: 0, commission: 0 };
      }
      months[monthYear].revenue += event.totalAmount;
      months[monthYear].commission += event.companyCommission;
    });

    Object.entries(months).forEach(([month, data]) => {
      monthlyData.push({
        name: month,
        revenue: data.revenue,
        commission: data.commission,
      });
    });

    // Définir l'ordre des mois en français (correspondant aux abréviations de date-fns)
    const frenchMonths = [
      "janv.",
      "févr.",
      "mars",
      "avr.",
      "mai",
      "juin",
      "juil.",
      "août",
      "sept.",
      "oct.",
      "nov.",
      "déc.",
    ];

    return monthlyData.sort((a, b) => {
      const [monthA, yearA] = a.name.split(" ");
      const [monthB, yearB] = b.name.split(" ");

      if (yearA !== yearB) {
        return Number(yearA) - Number(yearB);
      }

      const monthIndexA = frenchMonths.indexOf(monthA);
      const monthIndexB = frenchMonths.indexOf(monthB);

      // Handle case where month is not found in array (fallback to string comparison)
      if (monthIndexA === -1 || monthIndexB === -1) {
        return monthA.localeCompare(monthB);
      }

      return monthIndexA - monthIndexB;
    });
  }, [filteredEvents]);

  const getEventTypeLabel = (type: EventType | string) => {
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

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zarzis-blue heading-responsive">
          Finances
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Revenu total</CardDescription>
            <CardTitle className="text-2xl flex items-center justify-between">
              {totalRevenue} DT{" "}
              <DollarSign className="w-5 h-5 text-zarzis-blue" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {filteredEvents.length} événements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Commission entreprise</CardDescription>
            <CardTitle className="text-2xl flex items-center justify-between">
              {totalCommission} DT{" "}
              <TrendingUp className="w-5 h-5 text-zarzis-blue" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {Math.round((totalCommission / totalRevenue) * 100) || 0}% du
              revenu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Montant net (serveurs)</CardDescription>
            <CardTitle className="text-2xl flex items-center justify-between">
              {totalNetAmount} DT{" "}
              <DollarSign className="w-5 h-5 text-zarzis-blue" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {Math.round((totalNetAmount / totalRevenue) * 100) || 0}% du
              revenu
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-xl">Analyse financière</CardTitle>

            <div className="flex gap-4 flex-col sm:flex-row">
              <div className="grid w-full sm:w-[140px] items-center gap-1.5">
                <Label htmlFor="period">Période</Label>
                <Select
                  value={period}
                  onValueChange={(value: "all" | "month" | "quarter") =>
                    setPeriod(value)
                  }
                >
                  <SelectTrigger id="period">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tout</SelectItem>
                    <SelectItem value="month">Dernier mois</SelectItem>
                    <SelectItem value="quarter">Dernier trimestre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid w-full sm:w-[140px] items-center gap-1.5">
                <Label htmlFor="eventType">Type d'événement</Label>
                <Select
                  value={eventType}
                  onValueChange={(value: EventType | "all") =>
                    setEventType(value)
                  }
                >
                  <SelectTrigger id="eventType">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="marriage">Mariage</SelectItem>
                    <SelectItem value="fiancaille">Fiançailles</SelectItem>
                    <SelectItem value="anniversaire">Anniversaire</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>

        <Tabs defaultValue="chart" className="w-full">
          <CardHeader className="pb-0 pt-0">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chart">Graphique</TabsTrigger>
              <TabsTrigger value="details">Détails</TabsTrigger>
            </TabsList>
          </CardHeader>

          <TabsContent value="chart">
            <CardContent className="pt-4 pb-0">
              <div className="h-[300px]">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <defs>
                        <linearGradient
                          id="colorRevenue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#1E3A8A"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#1E3A8A"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorCommission"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#D4AF37"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#D4AF37"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        name="Revenu"
                        stroke="#1E3A8A"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                      <Area
                        type="monotone"
                        dataKey="commission"
                        name="Commission"
                        stroke="#D4AF37"
                        fillOpacity={1}
                        fill="url(#colorCommission)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">
                      Aucune donnée disponible pour cette période
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent value="details">
            <CardContent>
              <div className="responsive-table-container rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Type
                      </TableHead>
                      <TableHead className="text-right">Revenu</TableHead>
                      <TableHead className="text-right hidden sm:table-cell">
                        Commission
                      </TableHead>
                      <TableHead className="text-right">Net</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.length > 0 ? (
                      filteredEvents.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center">
                              <CalendarIcon className="mr-2 h-4 w-4 text-zarzis-blue" />
                              {format(new Date(event.date), "dd/MM/yy")}
                            </div>
                          </TableCell>
                          <TableCell>{event.clientName}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant="outline">
                              {getEventTypeLabel(event.eventType)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {event.totalAmount} DT
                          </TableCell>
                          <TableCell className="text-right hidden sm:table-cell">
                            {event.companyCommission} DT
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {event.totalAmount - event.companyCommission} DT
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          Aucun événement trouvé pour cette période.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>

        <CardFooter className="pt-0">
          <p className="text-sm text-muted-foreground">
            La commission est calculée à 20 DT par serveur pour les mariages et
            15 DT pour les autres événements.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Finances;
