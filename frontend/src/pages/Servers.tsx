import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  User,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Phone,
  Calendar,
  DollarSign,
  CreditCard,
  TrendingDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Server } from "@/types";
import { ServerForm } from "@/components/servers/ServerForm";
import { ServerDetails } from "@/components/servers/ServerDetails";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { serverService } from "@/services/serverService";
import {
  calculateTotalPaid,
  calculateOriginalEarnings,
  formatCurrency,
} from "@/lib/payment-utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Servers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [serverToEdit, setServerToEdit] = useState<Server | null>(null);
  const [serverToDelete, setServerToDelete] = useState<string | null>(null);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Fetch servers with React Query
  const {
    data: servers = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["servers"],
    queryFn: () => serverService.getAllServers(),
  });

  // Debug: Log servers data
  React.useEffect(() => {
    if (servers.length > 0) {
      console.log("Servers loaded:", servers.length);
      console.log("First server:", servers[0]);
      console.log("First server ID:", servers[0].id, typeof servers[0].id);
    }
  }, [servers]);

  // Create server mutation
  const createServerMutation = useMutation({
    mutationFn: (server: Omit<Server, "id">) =>
      serverService.createServer(server),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servers"] });
      setDialogOpen(false);
      toast({
        title: "Serveur ajouté",
        description: "Le serveur a été ajouté avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du serveur.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  // Update server mutation
  const updateServerMutation = useMutation({
    mutationFn: ({ id, server }: { id: string; server: Partial<Server> }) =>
      serverService.updateServer(id, server),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servers"] });
      queryClient.invalidateQueries({ queryKey: ["server", serverToEdit?.id] });
      setEditDialogOpen(false);
      setServerToEdit(null);
      toast({
        title: "Serveur modifié",
        description: "Le serveur a été modifié avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la modification du serveur.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  // Toggle server availability mutation
  const toggleAvailabilityMutation = useMutation({
    mutationFn: (serverId: string) =>
      serverService.toggleServerAvailability(serverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servers"] });
      toast({
        title: "Disponibilité mise à jour",
        description: "La disponibilité du serveur a été mise à jour.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la mise à jour de la disponibilité.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  // Delete server mutation
  const deleteServerMutation = useMutation({
    mutationFn: (id: string) => serverService.deleteServer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servers"] });
      toast({
        title: "Serveur supprimé",
        description: "Le serveur a été supprimé avec succès.",
      });
      setServerToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la suppression du serveur.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const handleAddServer = (server: Omit<Server, "id">) => {
    createServerMutation.mutate(server);
  };

  const handleEditServer = (server: Server) => {
    setServerToEdit(server);
    setEditDialogOpen(true);
  };

  const handleUpdateServer = (server: Omit<Server, "id">) => {
    if (serverToEdit) {
      updateServerMutation.mutate({
        id: serverToEdit.id,
        server: server,
      });
    }
  };

  const toggleServerAvailabilityHandler = (serverId: string) => {
    if (!serverId) {
      toast({
        title: "Erreur",
        description: "ID du serveur manquant",
        variant: "destructive",
      });
      return;
    }
    toggleAvailabilityMutation.mutate(serverId);
  };

  const handleDeleteServer = (id: string) => {
    console.log("Attempting to delete server with ID:", id, "Type:", typeof id);
    setServerToDelete(id);
  };

  const confirmDelete = () => {
    if (serverToDelete) {
      deleteServerMutation.mutate(serverToDelete);
    }
  };

  const openServerDetails = (server: Server) => {
    setSelectedServer(server);
    setDetailsDialogOpen(true);
  };

  const filteredServers = servers.filter((server) =>
    server.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-zarzis-blue">
          Serveurs
        </h1>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un serveur
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95%] max-w-[95%] sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau serveur</DialogTitle>
              <DialogDescription>
                Entrez les informations du serveur ci-dessous.
              </DialogDescription>
            </DialogHeader>
            <ServerForm onSubmit={handleAddServer} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un serveur..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Vue Bureau */}
          <div
            className={`rounded-md border ${
              isMobile
                ? "hidden"
                : "block overflow-x-auto responsive-table-container"
            }`}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Téléphone
                  </TableHead>
                  <TableHead className="text-center hidden sm:table-cell">
                    Événements
                  </TableHead>
                  <TableHead className="text-right">Gains totaux</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">
                    Argent reçu
                  </TableHead>
                  <TableHead className="text-right hidden md:table-cell">
                    Reste à payer
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Disponibilité
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Chargement des données...
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-destructive"
                    >
                      Erreur lors du chargement des données.
                    </TableCell>
                  </TableRow>
                ) : filteredServers.length > 0 ? (
                  filteredServers.map((server) => {
                    // Utiliser les fonctions utilitaires pour les calculs
                    const totalPaid = calculateTotalPaid(server);
                    const remainingAmount = server.totalEarnings || 0;
                    const originalTotalEarnings =
                      calculateOriginalEarnings(server);

                    return (
                      <TableRow key={server.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-zarzis-blue" />
                            <Button
                              variant="link"
                              className="p-0 h-auto font-medium"
                              onClick={() => openServerDetails(server)}
                            >
                              {server.name}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {server.phone || "—"}
                        </TableCell>
                        <TableCell className="text-center hidden sm:table-cell">
                          <Badge variant="outline">
                            {server.totalEvents} événements
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-blue-600">
                          {formatCurrency(originalTotalEarnings)} DT
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600 hidden sm:table-cell">
                          {formatCurrency(totalPaid)} DT
                        </TableCell>
                        <TableCell className="text-right font-medium text-orange-600 hidden md:table-cell">
                          {formatCurrency(remainingAmount)} DT
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={server.available}
                              onCheckedChange={() =>
                                toggleServerAvailabilityHandler(server.id)
                              }
                              disabled={toggleAvailabilityMutation.isPending}
                            />
                            <Label>
                              {server.available
                                ? "Disponible"
                                : "Non disponible"}
                            </Label>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/servers/${server.id}`)}
                              title="Voir plus de détails"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Voir plus
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openServerDetails(server)}
                              title="Aperçu rapide"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditServer(server)}
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteServer(server.id)}
                              title="Supprimer"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Aucun serveur trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Vue Mobile - Cartes de serveurs */}
          <div
            className={`grid gap-4 ${isMobile ? "block" : "hidden"}`}
            style={{ paddingBottom: "60px" }}
          >
            {isLoading ? (
              <div className="text-center py-8">Chargement des données...</div>
            ) : isError ? (
              <div className="text-center py-8 text-destructive">
                Erreur lors du chargement des données.
              </div>
            ) : filteredServers.length > 0 ? (
              filteredServers.map((server) => {
                // Utiliser les fonctions utilitaires pour les calculs
                const totalPaid = calculateTotalPaid(server);
                const remainingAmount = server.totalEarnings || 0;
                const originalTotalEarnings = calculateOriginalEarnings(server);

                return (
                  <Card
                    key={server.id}
                    className="overflow-hidden server-card server-card-appear"
                    style={{
                      animationDelay: `${
                        filteredServers.indexOf(server) * 0.1
                      }s`,
                    }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-zarzis-blue" />
                          <h3 className="font-semibold text-base">
                            {server.name}
                          </h3>
                        </div>
                        <Badge
                          variant={server.available ? "default" : "destructive"}
                          className="ml-2 badge"
                        >
                          {server.available ? "Disponible" : "Non disponible"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3 server-card-content">
                      <div className="grid grid-cols-2 gap-y-2 text-sm">
                        {server.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{server.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{server.totalEvents} événements</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-blue-600" />
                          <span className="font-medium text-blue-600">
                            {formatCurrency(originalTotalEarnings)} DT
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3 text-green-600" />
                          <span className="font-medium text-green-600">
                            {formatCurrency(totalPaid)} DT
                          </span>
                        </div>
                        <div className="flex items-center gap-1 col-span-2">
                          <TrendingDown className="h-3 w-3 text-orange-600" />
                          <span className="font-medium text-orange-600">
                            Reste: {formatCurrency(remainingAmount)} DT
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 flex justify-between border-t server-card-footer">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/servers/${server.id}`)}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Détails
                      </Button>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openServerDetails(server)}
                          title="Aperçu rapide"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditServer(server)}
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteServer(server.id)}
                          className="text-destructive hover:text-destructive"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-8">Aucun serveur trouvé.</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Détails du serveur</DialogTitle>
          </DialogHeader>
          {selectedServer && <ServerDetails server={selectedServer} />}
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier le serveur</DialogTitle>
            <DialogDescription>
              Modifiez les informations du serveur ci-dessous.
            </DialogDescription>
          </DialogHeader>
          {serverToEdit && (
            <ServerForm
              onSubmit={handleUpdateServer}
              initialData={serverToEdit}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!serverToDelete}
        onOpenChange={() => setServerToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Cela supprimera définitivement le
              serveur.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Servers;
