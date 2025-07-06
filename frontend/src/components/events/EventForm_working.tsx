import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  CalendarIcon, 
  User, 
  MapPin, 
  Users, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  XCircle,
  PartyPopper,
  Heart,
  Gift,
  Cake,
  MoreHorizontal,
  UserPlus,
  Calculator
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EventDetails, EventType, Server, ServerPricing } from "@/types";
import { serverService } from "@/services/serverService";

interface EventFormProps {
  onSubmit: (event: EventDetails) => void;
  initialData?: Partial<EventDetails>;
}

export function EventForm({ onSubmit, initialData }: EventFormProps) {
  const [clientName, setClientName] = useState(initialData?.clientName || "");
  const [eventType, setEventType] = useState<EventType>(
    initialData?.eventType || "marriage"
  );
  const [eventDate, setEventDate] = useState<Date>(
    initialData?.date || new Date()
  );
  const [location, setLocation] = useState(initialData?.location || "");
  const [numberOfServers, setNumberOfServers] = useState(
    initialData?.numberOfServers?.toString() || "1"
  );
  const [pricePerServer, setPricePerServer] = useState(
    initialData?.pricePerServer?.toString() || "100"
  );
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [selectedServerIds, setSelectedServerIds] = useState<string[]>(
    initialData?.assignedServers?.map((server) => server.id) || []
  );
  const [serverPricing, setServerPricing] = useState<ServerPricing[]>(
    initialData?.serverPricing || []
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: servers = [], isLoading } = useQuery<Server[]>({
    queryKey: ["servers"],
    queryFn: () => serverService.getAllServers(),
  });

  const availableServers = (servers as Server[]).filter(
    (server) => server.available
  );

  const validateForm = () => {
    const formErrors: Record<string, string> = {};
    if (!clientName) formErrors.clientName = "Le nom du client est requis";
    if (!eventType) formErrors.eventType = "Le type d'événement est requis";
    if (!eventDate) formErrors.eventDate = "La date est requise";
    if (!location) formErrors.location = "Le lieu est requis";
    if (!numberOfServers || parseInt(numberOfServers) < 1)
      formErrors.numberOfServers = "Le nombre de serveurs doit être au moins 1";
    if (selectedServerIds.length < parseInt(numberOfServers || "0"))
      formErrors.selectedServers = `Veuillez sélectionner ${numberOfServers} serveurs`;
    if (selectedServerIds.length > parseInt(numberOfServers || "0"))
      formErrors.selectedServers = `Vous avez sélectionné trop de serveurs`;

    // Validation des prix individuels
    serverPricing.forEach((pricing, index) => {
      if (pricing.clientPrice <= 0) {
        formErrors[`clientPrice_${pricing.serverId}`] = `Prix client requis pour ${pricing.serverName}`;
      }
      if (pricing.serverPay <= 0) {
        formErrors[`serverPay_${pricing.serverId}`] = `Paiement serveur requis pour ${pricing.serverName}`;
      }
      if (pricing.serverPay >= pricing.clientPrice) {
        formErrors[`pricing_${pricing.serverId}`] = `Le paiement serveur doit être inférieur au prix client pour ${pricing.serverName}`;
      }
    });

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const numServers = parseInt(numberOfServers);
    const assignedServers = servers.filter((server) =>
      selectedServerIds.includes(server.id)
    );

    // Calculer les montants basés sur la tarification individuelle
    const totalClientAmount = serverPricing.reduce((sum, pricing) => sum + pricing.clientPrice, 0);
    const totalServerPay = serverPricing.reduce((sum, pricing) => sum + pricing.serverPay, 0);
    const totalCommission = totalClientAmount - totalServerPay;

    const newEvent: EventDetails = {
      id: initialData?.id || "",
      clientName,
      eventType,
      date: eventDate,
      location,
      numberOfServers: numServers,
      pricePerServer: Math.round(totalClientAmount / numServers), // Prix moyen pour compatibilité
      totalAmount: totalClientAmount,
      companyCommission: totalCommission,
      netAmount: totalServerPay,
      notes,
      assignedServers,
      serverPricing,
    };

    onSubmit(newEvent);
  };

  const handleServerSelection = (serverId: string) => {
    const server = servers.find(s => s.id === serverId);
    if (!server) return;

    setSelectedServerIds((prev) => {
      if (prev.includes(serverId)) {
        // Retirer le serveur
        const newSelection = prev.filter((id) => id !== serverId);
        setServerPricing(current => current.filter(p => p.serverId !== serverId));
        return newSelection;
      } else {
        // Ajouter le serveur
        const newSelection = [...prev, serverId];
        setServerPricing(current => [
          ...current,
          {
            serverId,
            serverName: server.name,
            clientPrice: parseInt(pricePerServer) || 100,
            serverPay: Math.round((parseInt(pricePerServer) || 100) * 0.75), // 75% par défaut
            commission: Math.round((parseInt(pricePerServer) || 100) * 0.25), // 25% par défaut
          }
        ]);
        return newSelection;
      }
    });
  };

  const updateServerPricing = (serverId: string, field: 'clientPrice' | 'serverPay', value: number) => {
    setServerPricing(current => 
      current.map(pricing => {
        if (pricing.serverId === serverId) {
          const updated = { ...pricing, [field]: value };
          // Recalculer la commission
          updated.commission = updated.clientPrice - updated.serverPay;
          return updated;
        }
        return pricing;
      })
    );
  };

  const getEventTypeIcon = (type: EventType) => {
    switch (type) {
      case 'marriage': return <Heart className="h-5 w-5 text-pink-600" />;
      case 'fiancaille': return <Gift className="h-5 w-5 text-purple-600" />;
      case 'anniversaire': return <Cake className="h-5 w-5 text-orange-600" />;
      case 'autre': return <PartyPopper className="h-5 w-5 text-blue-600" />;
      default: return <MoreHorizontal className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6 p-2">
      {/* En-tête avec design moderne */}
      <div className="text-center pb-6">
        <div className="relative mx-auto w-16 h-16 mb-4">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-full shadow-2xl animate-pulse"></div>
          <div className="relative w-full h-full bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center shadow-xl transform transition-transform hover:scale-105">
            <PartyPopper className="h-8 w-8 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
          {initialData?.id ? "Modifier l'événement" : "Nouvel événement"}
        </h3>
        <p className="text-base text-muted-foreground max-w-md mx-auto">
          {initialData?.id 
            ? "Modifiez les détails de votre événement pour une organisation parfaite" 
            : "Créez un événement mémorable avec tous les détails nécessaires"
          }
        </p>
        
        {/* Indicateur de progression */}
        <div className="mt-6 flex items-center justify-center space-x-2">
          <div className={cn(
            "w-2 h-2 rounded-full transition-all duration-300",
            clientName ? "bg-blue-500 scale-125" : "bg-gray-300"
          )}></div>
          <div className={cn(
            "w-2 h-2 rounded-full transition-all duration-300",
            eventType ? "bg-blue-500 scale-125" : "bg-gray-300"
          )}></div>
          <div className={cn(
            "w-2 h-2 rounded-full transition-all duration-300",
            location ? "bg-blue-500 scale-125" : "bg-gray-300"
          )}></div>
          <div className={cn(
            "w-2 h-2 rounded-full transition-all duration-300",
            selectedServerIds.length > 0 ? "bg-blue-500 scale-125" : "bg-gray-300"
          )}></div>
        </div>
      </div>
      <div className="text-center pb-6">
        <div className="relative mx-auto w-16 h-16 mb-4">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-full shadow-2xl animate-pulse"></div>
          <div className="relative w-full h-full bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center shadow-xl transform transition-transform hover:scale-105">
            <PartyPopper className="h-8 w-8 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
          {initialData?.id ? "Modifier l'événement" : "Nouvel événement"}
        </h3>
        <p className="text-base text-muted-foreground max-w-md mx-auto">
          {initialData?.id 
            ? "Modifiez les détails de votre événement pour une organisation parfaite" 
            : "Créez un événement mémorable avec tous les détails nécessaires"
          }
        </p>
        
        {/* Indicateur de progression */}
        <div className="mt-6 flex items-center justify-center space-x-2">
          <div className={cn(
            "w-2 h-2 rounded-full transition-all duration-300",
            clientName ? "bg-blue-500 scale-125" : "bg-gray-300"
          )}></div>
          <div className={cn(
            "w-2 h-2 rounded-full transition-all duration-300",
            eventType ? "bg-blue-500 scale-125" : "bg-gray-300"
          )}></div>
          <div className={cn(
            "w-2 h-2 rounded-full transition-all duration-300",
            location ? "bg-blue-500 scale-125" : "bg-gray-300"
          )}></div>
          <div className={cn(
            "w-2 h-2 rounded-full transition-all duration-300",
            selectedServerIds.length > 0 ? "bg-blue-500 scale-125" : "bg-gray-300"
          )}></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nom du client */}
          <Card className="border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Label htmlFor="clientName" className="flex items-center gap-3 text-base font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                  <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  Nom du client
                </Label>
                <div className="relative">
                  <Input
                    id="clientName"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Nom complet du client"
                    className={cn(
                      "pl-5 pr-5 h-12 text-base border-2 rounded-xl transition-all duration-300 bg-gray-50 focus:bg-white",
                      errors.clientName 
                        ? "border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50" 
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-100 hover:border-blue-300"
                    )}
                  />
                  {clientName && !errors.clientName && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                </div>
                {errors.clientName && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                    <XCircle className="h-4 w-4 flex-shrink-0" />
                    <p className="text-sm font-medium">{errors.clientName}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Type d'événement */}
          <Card className="border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Label htmlFor="eventType" className="flex items-center gap-3 text-base font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                  <div className="p-2 bg-pink-50 rounded-lg group-hover:bg-pink-100 transition-colors">
                    {getEventTypeIcon(eventType)}
                  </div>
                  Type d'événement
                </Label>
                <Select
                  value={eventType}
                  onValueChange={(value) => setEventType(value as EventType)}
                >
                  <SelectTrigger
                    id="eventType"
                    className={cn(
                      "h-12 text-base border-2 rounded-xl transition-all duration-300 bg-gray-50 focus:bg-white",
                      errors.eventType 
                        ? "border-red-300 focus:border-red-500" 
                        : "border-gray-200 focus:border-blue-500 hover:border-blue-300"
                    )}
                  >
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marriage">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-pink-600" />
                        Mariage
                      </div>
                    </SelectItem>
                    <SelectItem value="fiancaille">
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4 text-purple-600" />
                        Fiançailles
                      </div>
                    </SelectItem>
                    <SelectItem value="anniversaire">
                      <div className="flex items-center gap-2">
                        <Cake className="h-4 w-4 text-orange-600" />
                        Anniversaire
                      </div>
                    </SelectItem>
                    <SelectItem value="autre">
                      <div className="flex items-center gap-2">
                        <PartyPopper className="h-4 w-4 text-blue-600" />
                        Autre
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.eventType && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                    <XCircle className="h-4 w-4 flex-shrink-0" />
                    <p className="text-sm font-medium">{errors.eventType}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-2">
          <Label htmlFor="eventDate">Date de l'événement</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !eventDate && "text-muted-foreground",
                  errors.eventDate && "border-destructive"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {eventDate ? (
                  format(eventDate, "PPP", { locale: fr })
                ) : (
                  <span>Date...</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={eventDate}
                onSelect={(date) => date && setEventDate(date)}
                initialFocus
                locale={fr}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          {errors.eventDate && (
            <p className="text-xs text-destructive">{errors.eventDate}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Lieu</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Adresse ou nom de salle"
            className={errors.location ? "border-destructive" : ""}
          />
          {errors.location && (
            <p className="text-xs text-destructive">{errors.location}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="numberOfServers">Nombre de serveurs</Label>
          <Input
            id="numberOfServers"
            type="number"
            min="1"
            value={numberOfServers}
            onChange={(e) => setNumberOfServers(e.target.value)}
            placeholder="Nombre de serveurs"
            className={errors.numberOfServers ? "border-destructive" : ""}
          />
          {errors.numberOfServers && (
            <p className="text-xs text-destructive">{errors.numberOfServers}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="pricePerServer">Prix par serveur par défaut (DT) - Optionnel</Label>
          <Input
            id="pricePerServer"
            type="number"
            min="1"
            value={pricePerServer}
            onChange={(e) => setPricePerServer(e.target.value)}
            placeholder="Prix par défaut (sera appliqué aux nouveaux serveurs)"
            className={errors.pricePerServer ? "border-destructive" : ""}
          />
          <p className="text-xs text-muted-foreground">
            Ce prix sera utilisé comme valeur par défaut lors de la sélection de nouveaux serveurs
          </p>
          {errors.pricePerServer && (
            <p className="text-xs text-destructive">{errors.pricePerServer}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>
          Sélectionner les serveurs ({selectedServerIds.length}/
          {numberOfServers})
        </Label>
        {errors.selectedServers && (
          <p className="text-xs text-destructive">{errors.selectedServers}</p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-md p-2">
          {isLoading ? (
            <div className="col-span-3 p-4 text-center">
              Chargement des serveurs...
            </div>
          ) : availableServers.length === 0 ? (
            <div className="col-span-3 p-4 text-center">
              Aucun serveur disponible
            </div>
          ) : (
            availableServers.map((server) => (
              <Card
                key={server.id}
                className={cn(
                  "p-2 cursor-pointer transition-colors",
                  selectedServerIds.includes(server.id)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
                onClick={() => handleServerSelection(server.id)}
              >
                {server.name}
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Section pour configurer les prix individuels */}
      {selectedServerIds.length > 0 && (
        <div className="space-y-4">
          <Label className="text-lg font-semibold">Configuration des prix par serveur</Label>
          <div className="space-y-3">
            {serverPricing.map((pricing) => (
              <Card key={pricing.serverId} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="font-medium">
                    {pricing.serverName}
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-sm">Prix client (DT)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={pricing.clientPrice}
                      onChange={(e) => updateServerPricing(
                        pricing.serverId, 
                        'clientPrice', 
                        parseInt(e.target.value) || 0
                      )}
                      placeholder="Prix demandé"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-sm">Paiement serveur (DT)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={pricing.serverPay}
                      onChange={(e) => updateServerPricing(
                        pricing.serverId, 
                        'serverPay', 
                        parseInt(e.target.value) || 0
                      )}
                      placeholder="Paiement serveur"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-sm">Commission</Label>
                    <div className="p-2 bg-muted rounded-md text-center font-medium">
                      {pricing.commission} DT
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            
            {/* Résumé des totaux */}
            <Card className="p-4 bg-primary/5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <Label className="text-sm text-muted-foreground">Total Client</Label>
                  <div className="text-lg font-bold">
                    {serverPricing.reduce((sum, p) => sum + p.clientPrice, 0)} DT
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Total Serveurs</Label>
                  <div className="text-lg font-bold">
                    {serverPricing.reduce((sum, p) => sum + p.serverPay, 0)} DT
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Commission Totale</Label>
                  <div className="text-lg font-bold text-green-600">
                    {serverPricing.reduce((sum, p) => sum + p.commission, 0)} DT
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Marge (%)</Label>
                  <div className="text-lg font-bold">
                    {serverPricing.length > 0 
                      ? Math.round((serverPricing.reduce((sum, p) => sum + p.commission, 0) / 
                          serverPricing.reduce((sum, p) => sum + p.clientPrice, 0)) * 100)
                      : 0}%
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optionnel)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes supplémentaires sur l'événement"
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full">
        {initialData?.id ? "Mettre à jour l'événement" : "Ajouter l'événement"}
      </Button>
    </form>
  );
}
