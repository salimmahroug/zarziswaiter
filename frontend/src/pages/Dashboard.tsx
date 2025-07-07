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
import Logo from "@/components/ui/Logo";
import "@/styles/dashboard.css";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-zarzis-light to-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header Section avec gradient */}
        <div className="relative overflow-hidden bg-gradient-to-r from-zarzis-primary via-zarzis-primary-light to-zarzis-primary-dark rounded-2xl shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative px-6 py-8 sm:px-8 sm:py-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Logo 
                  size="lg" 
                  variant="white" 
                  showText={false}
                  className="hidden sm:flex"
                />
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
                    Tableau de bord
                  </h1>
                  <p className="text-blue-100 text-sm sm:text-base">
                    Vue d'ensemble de votre activité • Waiter of Zarzis
                  </p>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-all duration-200 shadow-lg"
                    disabled={resetting}
                  >
                    {resetting ? (
                      <>
                        <RotateCcw className="animate-spin w-4 h-4 mr-2" />
                        Réinitialisation...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Réinitialiser les revenus
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white/95 backdrop-blur-sm">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl">
                      Réinitialiser les revenus et commissions
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600">
                      Êtes-vous sûr de vouloir réinitialiser tous les revenus et
                      commissions ? Cette action est irréversible et affectera tous les
                      événements passés.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200">
                      Annuler
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button
                        variant="destructive"
                        onClick={handleResetRevenue}
                        disabled={resetting}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        {resetting ? (
                          <>
                            <RotateCcw className="animate-spin w-4 h-4 mr-2" />
                            Réinitialisation...
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Réinitialiser
                          </>
                        )}
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        {/* Stats Cards avec design moderne */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Carte Événements */}
          <Card className="group hover:scale-105 transition-all duration-300 bg-gradient-to-br from-zarzis-primary to-zarzis-primary-dark border-0 shadow-xl hover:shadow-2xl stats-card shine-effect glow-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">
                    Événements
                  </p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {stats.totalEvents}
                  </p>
                  <p className="text-blue-200 text-xs mt-1">
                    Événements réservés
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors icon-bounce">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carte Serveurs */}
          <Card className="group hover:scale-105 transition-all duration-300 bg-gradient-to-br from-emerald-500 to-emerald-700 border-0 shadow-xl hover:shadow-2xl stats-card shine-effect glow-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium uppercase tracking-wide">
                    Serveurs
                  </p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {servers.length}
                  </p>
                  <p className="text-emerald-200 text-xs mt-1">
                    Serveurs disponibles
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors icon-bounce">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carte Revenus */}
          <Card className="group hover:scale-105 transition-all duration-300 bg-gradient-to-br from-zarzis-secondary to-yellow-600 border-0 shadow-xl hover:shadow-2xl stats-card shine-effect glow-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium uppercase tracking-wide">
                    Revenus
                  </p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {stats.totalRevenue} DT
                  </p>
                  <p className="text-amber-200 text-xs mt-1">
                    Tous événements
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors icon-bounce">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carte Commission */}
          <Card className="group hover:scale-105 transition-all duration-300 bg-gradient-to-br from-zarzis-primary-light to-zarzis-primary border-0 shadow-xl hover:shadow-2xl stats-card shine-effect glow-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium uppercase tracking-wide">
                    Commission
                  </p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {stats.totalCommission} DT
                  </p>
                  <p className="text-purple-200 text-xs mt-1">
                    Profit entreprise
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors icon-bounce">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section Graphiques et Événements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Graphique des revenus */}
          <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-zarzis-primary to-zarzis-primary-light rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl lg:text-2xl bg-gradient-to-r from-zarzis-primary to-zarzis-primary-dark bg-clip-text text-transparent">
                    Revenus par mois
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Répartition des revenus pour l'année en cours
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-6">
              <div className="h-[300px] sm:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: isMobile ? 10 : 30,
                      left: isMobile ? 0 : 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      fontSize={isMobile ? 11 : 13} 
                      stroke="#64748b"
                    />
                    <YAxis 
                      fontSize={isMobile ? 11 : 13} 
                      stroke="#64748b"
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: isMobile ? 11 : 13 }} />
                    <Bar 
                      dataKey="revenue" 
                      fill="url(#blueGradient)" 
                      name="Revenu total"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="commission" 
                      fill="url(#goldGradient)" 
                      name="Commission"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.9}/>
                      </linearGradient>
                      <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#d97706" stopOpacity={0.9}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Prochains événements */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-zarzis-secondary to-zarzis-accent rounded-lg">
                  <CalendarClock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg lg:text-xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Prochains événements
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Les 3 prochains événements planifiés
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="space-y-4">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event, index) => (
                    <div
                      key={event.id}
                      className="group p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-emerald-50 hover:to-teal-50 border border-gray-200 hover:border-emerald-200 transition-all duration-200 event-card"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                            <p className="font-semibold text-gray-900 truncate">
                              {event.clientName}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 capitalize">
                            {event.eventType} • {event.numberOfServers} serveurs
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <CalendarClock className="w-3 h-3 text-emerald-600" />
                            <span className="text-xs text-emerald-700 font-medium">
                              {new Date(event.date).toLocaleDateString("fr-FR", {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short'
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3 text-right">
                          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {index + 1}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CalendarClock className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">
                      Aucun événement à venir
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
