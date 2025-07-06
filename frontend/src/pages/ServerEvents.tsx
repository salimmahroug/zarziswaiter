import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Users } from "lucide-react";
import { serverService } from "@/services/serverService";
import { ServerEventsCard } from "@/components/servers/ServerEventsCard";

const ServerEventsView = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch servers
  const {
    data: servers = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["servers"],
    queryFn: () => serverService.getAllServers(),
  });

  // Filter servers based on search query
  const filteredServers = servers.filter((server) =>
    server.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-zarzis-blue">
            Événements des Serveurs
          </h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">
            Chargement des serveurs...
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-zarzis-blue">
            Événements des Serveurs
          </h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              Erreur lors du chargement des serveurs.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zarzis-blue">
            Événements des Serveurs
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Consultez l'historique et les gains de chaque serveur
          </p>
        </div>

        {/* Statistiques rapides */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="bg-blue-50 px-3 sm:px-4 py-2 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Total serveurs</p>
                <p className="text-base sm:text-lg font-bold text-gray-900">
                  {servers.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 px-3 sm:px-4 py-2 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Disponibles</p>
                <p className="text-base sm:text-lg font-bold text-gray-900">
                  {servers.filter((s) => s.available).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un serveur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Grille des cartes de serveurs */}
      {filteredServers.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun serveur trouvé
              </h3>
              <p className="text-gray-600">
                {searchQuery
                  ? "Aucun serveur ne correspond à votre recherche."
                  : "Aucun serveur n'est enregistré dans le système."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredServers.map((server) => (
            <ServerEventsCard key={server.id} server={server} />
          ))}
        </div>
      )}

      {/* Résumé global */}
      {servers.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardHeader className="py-4 sm:py-6">
            <CardTitle className="flex items-center gap-2 text-blue-900 text-lg sm:text-xl">
              <Users className="h-5 w-5" />
              Résumé Global
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-2">
                <p className="text-xs sm:text-sm text-gray-600">
                  Serveurs actifs
                </p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">
                  {servers.filter((s) => s.available).length}
                </p>
              </div>
              <div className="p-2">
                <p className="text-xs sm:text-sm text-gray-600">
                  Total événements
                </p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {servers.reduce((sum, s) => sum + s.totalEvents, 0)}
                </p>
              </div>
              <div className="p-2">
                <p className="text-xs sm:text-sm text-gray-600">Gains totaux</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">
                  {servers.reduce((sum, s) => sum + s.totalEarnings, 0)} DT
                </p>
              </div>
              <div className="p-2">
                <p className="text-xs sm:text-sm text-gray-600">
                  Gain moyen/serveur
                </p>
                <p className="text-xl sm:text-2xl font-bold text-orange-600">
                  {servers.length > 0
                    ? Math.round(
                        servers.reduce((sum, s) => sum + s.totalEarnings, 0) /
                          servers.length
                      )
                    : 0}{" "}
                  DT
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ServerEventsView;
