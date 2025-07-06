import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Calendar,
  DollarSign,
  Users,
  CalendarClock,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { eventService } from "@/services/eventService";
import { serverService } from "@/services/serverService";
import { EventDetails } from "@/types";
import { useScreenSize } from "@/hooks/use-mobile";
import { toast } from "sonner";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRevenue: 0,
    totalCommission: 0,
  });
  const [servers, setServers] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const { isMobile } = useScreenSize();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger les statistiques
        const eventStats = await eventService.getEventStats();
        setStats(eventStats);

        // Charger les serveurs
        const serversData = await serverService.getAllServers();
        setServers(serversData);

        // Charger les données du graphique
        const revenueData = await eventService.getMonthlyRevenue();
        setChartData(revenueData);

        // Charger les événements à venir
        const allEvents = await eventService.getAllEvents();
        const upcoming = allEvents
          .filter((event) => new Date(event.date) > new Date())
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )
          .slice(0, 3);
        setUpcomingEvents(upcoming);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleResetRevenue = async () => {
    setResetting(true);
    try {
      await eventService.resetRevenueAndCommissions();
      // Recharger les données après la réinitialisation
      const eventStats = await eventService.getEventStats();
      setStats(eventStats);      // Recharger aussi les données du graphique
      const revenueData = await eventService.getMonthlyRevenue();
      setChartData(revenueData);
      
      toast.success("Revenus et commissions réinitialisés avec succès !");
    } catch (error) {
      console.error("Erreur lors de la réinitialisation:", error);
      toast.error("Erreur lors de la réinitialisation. Veuillez réessayer.");
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-zarzis-blue">
          Tableau de bord
        </h1>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              className="flex items-center gap-2"
              disabled={resetting}
            >
              {resetting ? (
                <>
                  <RotateCcw className="animate-spin w-4 h-4" />
                  Réinitialisation...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Réinitialiser les revenus
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Réinitialiser les revenus et commissions
              </AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir réinitialiser tous les revenus et
                commissions ? Cette action est irréversible et affectera tous les
                événements passés.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                asChild
                className="bg-muted hover:bg-muted/80"
              >
                <Button>Annuler</Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button
                  variant="destructive"
                  onClick={handleResetRevenue}
                  disabled={resetting}
                >
                  {resetting ? (
                    <>
                      <RotateCcw className="animate-spin w-4 h-4" />
                      Réinitialisation...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      Réinitialiser
                    </>
                  )}
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardDescription>Total des événements</CardDescription>
            <CardTitle className="text-xl sm:text-2xl flex items-center justify-between">
              {stats.totalEvents}{" "}
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-zarzis-blue" />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Événements réservés
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardDescription>Total des serveurs</CardDescription>
            <CardTitle className="text-xl sm:text-2xl flex items-center justify-between">
              {servers.length}{" "}
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-zarzis-blue" />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Serveurs disponibles
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardDescription>Revenu total</CardDescription>
            <CardTitle className="text-xl sm:text-2xl flex items-center justify-between">
              {stats.totalRevenue} DT{" "}
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-zarzis-blue" />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Tous événements
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardDescription>Commission entreprise</CardDescription>
            <CardTitle className="text-xl sm:text-2xl flex items-center justify-between">
              {stats.totalCommission} DT{" "}
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-zarzis-blue" />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Profit de l'entreprise
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">
              Revenus par mois
            </CardTitle>
            <CardDescription>
              Répartition des revenus pour l'année en cours
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-4 pb-4 sm:pb-6">
            <div className="h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: isMobile ? 10 : 30,
                    left: isMobile ? 0 : 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={isMobile ? 10 : 12} />
                  <YAxis fontSize={isMobile ? 10 : 12} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                  <Bar dataKey="revenue" fill="#1E3A8A" name="Revenu total" />
                  <Bar dataKey="commission" fill="#D4AF37" name="Commission" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">
              Prochains événements
            </CardTitle>
            <CardDescription>
              Les 3 prochains événements planifiés
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="space-y-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="max-w-[65%]">
                        <p className="font-medium text-sm sm:text-base truncate">
                          {event.clientName}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground capitalize truncate">
                          {event.eventType} - {event.numberOfServers} serveurs
                        </p>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <CalendarClock className="w-3 h-3 sm:w-4 sm:h-4 text-zarzis-blue" />
                        <span className="text-xs sm:text-sm">
                          {new Date(event.date).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground text-sm">
                  Aucun événement à venir
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
