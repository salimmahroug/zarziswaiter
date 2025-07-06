import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Calendar, Download, Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EventDetails } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EventForm } from "@/components/events/EventForm";
import { EventDetail } from "@/components/events/EventDetail";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getEvents, createEvent, deleteEvent } from "@/services/eventService";

const Events = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch events with React Query
  const {
    data: events = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setDialogOpen(false);
      toast({
        title: "Événement ajouté",
        description: "L'événement a été ajouté avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout de l'événement.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setDetailsOpen(false);
      toast({
        title: "Événement supprimé",
        description: "L'événement a été supprimé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la suppression de l'événement.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const filteredEvents = events
    .filter(
      (event) =>
        (event.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (filterType === "all" || event.eventType === filterType)
    )
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const handleAddEvent = (event: EventDetails) => {
    createEventMutation.mutate(event);
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) {
      deleteEventMutation.mutate(id);
    }
  };

  const handleExportData = () => {
    toast({
      title: "Export des données",
      description:
        "L'export des données a été initié. Le fichier sera téléchargé sous peu.",
    });
  };

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getRowStyle = (event: EventDetails) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (event.date.getTime() < today.getTime()) {
      return "opacity-50"; // Past events
    }
    return "";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-zarzis-blue heading-responsive">
          Événements
        </h1>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                <Plus className="mr-2 h-5 w-5" />
                Ajouter un événement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[95vh] overflow-y-auto bg-gradient-to-br from-white to-blue-50/30 border-0 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 rounded-lg"></div>
              <div className="relative">
                <DialogHeader className="text-center pb-6">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mb-4 shadow-xl">
                    <Plus className="h-8 w-8 text-white" />
                  </div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Créer un nouvel événement
                  </DialogTitle>
                  <DialogDescription className="text-base text-muted-foreground max-w-md mx-auto">
                    Organisez votre événement parfait en remplissant tous les
                    détails nécessaires pour une expérience inoubliable
                  </DialogDescription>
                </DialogHeader>
                <EventForm onSubmit={handleAddEvent} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher par nom ou lieu..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={filterType}
              onValueChange={(value) => setFilterType(value)}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Type d'événement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="marriage">Mariage</SelectItem>
                <SelectItem value="fiancaille">Fiançailles</SelectItem>
                <SelectItem value="anniversaire">Anniversaire</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border responsive-table-container">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Lieu</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">
                    Serveurs
                  </TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Chargement des données...
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-destructive"
                    >
                      Erreur lors du chargement des données.
                    </TableCell>
                  </TableRow>
                ) : filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <TableRow key={event.id} className={cn(getRowStyle(event))}>
                      <TableCell className="font-medium whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-zarzis-blue" />
                          {formatDate(event.date)}
                        </div>
                      </TableCell>
                      <TableCell>{event.clientName}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="capitalize">
                          {getEventTypeLabel(event.eventType)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {event.location}
                      </TableCell>
                      <TableCell className="text-right hidden sm:table-cell">
                        {event.numberOfServers}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {event.totalAmount} DT
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedEvent(event);
                            setDetailsOpen(true);
                          }}
                        >
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Aucun événement trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de l'événement</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <EventDetail event={selectedEvent} />
              <div className="flex justify-end mt-4">
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  disabled={deleteEventMutation.isPending}
                >
                  Supprimer l'événement
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Events;
