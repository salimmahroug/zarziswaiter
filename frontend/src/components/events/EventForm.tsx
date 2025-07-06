import React, { useState } from "react";
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
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EventDetails, EventType, CatererType, Server } from "@/types";
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
  const [caterer, setCaterer] = useState<CatererType>(
    initialData?.caterer || "prive-sans-traiteur"
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
  const [serverPayAmount, setServerPayAmount] = useState(
    initialData?.serverPayAmount?.toString() || "80"
  );
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [selectedServerIds, setSelectedServerIds] = useState<string[]>(
    initialData?.assignedServers?.map((server) => server.id) || []
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
    if (!caterer) formErrors.caterer = "Le traiteur est requis";
    if (!eventDate) formErrors.eventDate = "La date est requise";
    if (!location) formErrors.location = "Le lieu est requis";
    if (!numberOfServers || parseInt(numberOfServers) < 1)
      formErrors.numberOfServers = "Le nombre de serveurs doit être au moins 1";
    if (!pricePerServer || parseInt(pricePerServer) <= 0)
      formErrors.pricePerServer = "Le prix par serveur doit être supérieur à 0";
    if (!serverPayAmount || parseInt(serverPayAmount) <= 0)
      formErrors.serverPayAmount =
        "Le prix donné au serveur doit être supérieur à 0";
    if (parseInt(serverPayAmount || "0") >= parseInt(pricePerServer || "0"))
      formErrors.serverPayAmount =
        "Le prix donné au serveur doit être inférieur au prix par serveur";
    if (selectedServerIds.length < parseInt(numberOfServers || "0"))
      formErrors.selectedServers = `Veuillez sélectionner ${numberOfServers} serveurs`;
    if (selectedServerIds.length > parseInt(numberOfServers || "0"))
      formErrors.selectedServers = `Vous avez sélectionné trop de serveurs`;

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    const numServers = parseInt(numberOfServers);
    const price = parseInt(pricePerServer);
    const serverPay = parseInt(serverPayAmount);
    // Prix que le traiteur nous paie = nombre de serveurs × prix par serveur
    const cateringPrice = numServers * price;

    let totalAmount, companyCommission, netAmount;

    if (caterer === "prive-sans-traiteur") {
      // Événement privé : le client nous paie directement
      const serversCost = numServers * price;
      totalAmount = serversCost;
      companyCommission = (price - serverPay) * numServers;
      netAmount = numServers * serverPay;
    } else {
      // Événement avec traiteur : c'est le traiteur qui nous paie
      totalAmount = cateringPrice; // Le traiteur nous paie : nombre serveurs × prix par serveur
      netAmount = numServers * serverPay; // Montant à payer aux serveurs
      companyCommission = totalAmount - netAmount; // Notre commission = ce qu'on reçoit - ce qu'on paie
    }

    const assignedServers = servers.filter((server) =>
      selectedServerIds.includes(server.id)
    );

    const newEvent: EventDetails = {
      id: initialData?.id || "",
      clientName,
      eventType,
      caterer,
      catererPrice: cateringPrice,
      date: eventDate,
      location,
      numberOfServers: numServers,
      pricePerServer: price,
      serverPayAmount: serverPay,
      totalAmount,
      companyCommission,
      netAmount,
      notes,
      assignedServers,
    };

    onSubmit(newEvent);
  };

  const handleServerSelection = (serverId: string) => {
    setSelectedServerIds((prev) => {
      const isSelected = prev.includes(serverId);
      const maxServers = parseInt(numberOfServers) || 1;

      if (isSelected) {
        return prev.filter((id) => id !== serverId);
      } else if (prev.length < maxServers) {
        return [...prev, serverId];
      }
      return prev;
    });
  };
  const getEventTypeIcon = (type: EventType) => {
    switch (type) {
      case "marriage":
        return <Heart className="h-5 w-5 text-pink-600" />;
      case "fiancaille":
        return <Gift className="h-5 w-5 text-purple-600" />;
      case "anniversaire":
        return <Cake className="h-5 w-5 text-orange-600" />;
      case "autre":
        return <PartyPopper className="h-5 w-5 text-blue-600" />;
      default:
        return <MoreHorizontal className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCatererIcon = (caterer: CatererType) => {
    switch (caterer) {
      case "chef-souma":
        return <User className="h-5 w-5 text-green-600" />;
      case "ayoub-chaftar":
        return <User className="h-5 w-5 text-blue-600" />;
      case "prive-sans-traiteur":
        return <Users className="h-5 w-5 text-gray-600" />;
      default:
        return <User className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCatererLabel = (caterer: CatererType) => {
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

  return (
    <div className="space-y-8 p-2">
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
            : "Créez un événement mémorable avec tous les détails nécessaires"}
        </p>

        {/* Indicateur de progression */}
        <div className="mt-6 flex items-center justify-center space-x-2">
          <div
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              clientName ? "bg-blue-500 scale-125" : "bg-gray-300"
            )}
          ></div>
          <div
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              eventType ? "bg-blue-500 scale-125" : "bg-gray-300"
            )}
          ></div>
          <div
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              location ? "bg-blue-500 scale-125" : "bg-gray-300"
            )}
          ></div>
          <div
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              selectedServerIds.length > 0
                ? "bg-blue-500 scale-125"
                : "bg-gray-300"
            )}
          ></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nom du client */}
          <Card className="border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Label
                  htmlFor="clientName"
                  className="flex items-center gap-3 text-base font-semibold text-gray-700 group-hover:text-blue-600 transition-colors"
                >
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
                <Label
                  htmlFor="eventType"
                  className="flex items-center gap-3 text-base font-semibold text-gray-700 group-hover:text-blue-600 transition-colors"
                >
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
                </Select>{" "}
                {errors.eventType && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                    <XCircle className="h-4 w-4 flex-shrink-0" />
                    <p className="text-sm font-medium">{errors.eventType}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Traiteur */}
          <Card className="border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Label
                  htmlFor="caterer"
                  className="flex items-center gap-3 text-base font-semibold text-gray-700 group-hover:text-purple-600 transition-colors"
                >
                  <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                    {getCatererIcon(caterer)}
                  </div>
                  Traiteur
                </Label>
                <Select
                  value={caterer}
                  onValueChange={(value) => setCaterer(value as CatererType)}
                >
                  <SelectTrigger
                    id="caterer"
                    className={cn(
                      "h-12 text-base border-2 rounded-xl transition-all duration-300 bg-gray-50 focus:bg-white",
                      errors.caterer
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-purple-500 hover:border-purple-300"
                    )}
                  >
                    <SelectValue placeholder="Sélectionner un traiteur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chef-souma">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-green-600" />
                        Chef Souma
                      </div>
                    </SelectItem>
                    <SelectItem value="ayoub-chaftar">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" />
                        Ayoub Chaftar
                      </div>
                    </SelectItem>
                    <SelectItem value="prive-sans-traiteur">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-600" />
                        Privé sans traiteur
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.caterer && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                    <XCircle className="h-4 w-4 flex-shrink-0" />
                    <p className="text-sm font-medium">{errors.caterer}</p>
                  </div>
                )}{" "}
                {/* Prix que le traiteur nous paie (calculé automatiquement) */}
                {caterer !== "prive-sans-traiteur" &&
                  numberOfServers &&
                  pricePerServer && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Prix que le traiteur nous paie (DT)
                      </Label>
                      <div className="bg-purple-50 p-3 rounded-lg border-2 border-purple-200">
                        <p className="text-xl font-bold text-purple-700">
                          {parseInt(numberOfServers) * parseInt(pricePerServer)}{" "}
                          DT
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Calcul automatique: {numberOfServers} serveurs ×{" "}
                          {pricePerServer} DT
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Le traiteur nous paie ce montant basé sur nos tarifs
                        standards
                      </p>
                      {errors.catererPrice && (
                        <p className="text-xs text-red-600">
                          {errors.catererPrice}
                        </p>
                      )}
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Date et lieu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date */}
          <Card className="border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Label
                  htmlFor="eventDate"
                  className="flex items-center gap-3 text-base font-semibold text-gray-700 group-hover:text-blue-600 transition-colors"
                >
                  <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                    <CalendarIcon className="h-5 w-5 text-green-600" />
                  </div>
                  Date de l'événement
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full h-12 justify-start text-left font-normal border-2 rounded-xl bg-gray-50 hover:bg-white transition-all duration-300",
                        !eventDate && "text-muted-foreground",
                        errors.eventDate
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-blue-500 hover:border-blue-300"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {eventDate ? (
                        format(eventDate, "PPP", { locale: fr })
                      ) : (
                        <span>Sélectionner une date...</span>
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
                    />
                  </PopoverContent>
                </Popover>
                {errors.eventDate && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                    <XCircle className="h-4 w-4 flex-shrink-0" />
                    <p className="text-sm font-medium">{errors.eventDate}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lieu */}
          <Card className="border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Label
                  htmlFor="location"
                  className="flex items-center gap-3 text-base font-semibold text-gray-700 group-hover:text-blue-600 transition-colors"
                >
                  <div className="p-2 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                    <MapPin className="h-5 w-5 text-orange-600" />
                  </div>
                  Lieu de l'événement
                </Label>
                <div className="relative">
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Adresse ou nom de la salle"
                    className={cn(
                      "pl-5 pr-5 h-12 text-base border-2 rounded-xl transition-all duration-300 bg-gray-50 focus:bg-white",
                      errors.location
                        ? "border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-100 hover:border-blue-300"
                    )}
                  />
                  {location && !errors.location && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                </div>
                {errors.location && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                    <XCircle className="h-4 w-4 flex-shrink-0" />
                    <p className="text-sm font-medium">{errors.location}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Serveurs et tarifs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre de serveurs */}
          <Card className="border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Label
                  htmlFor="numberOfServers"
                  className="flex items-center gap-3 text-base font-semibold text-gray-700 group-hover:text-blue-600 transition-colors"
                >
                  <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  Nombre de serveurs
                </Label>
                <div className="relative">
                  <Input
                    id="numberOfServers"
                    type="number"
                    min="1"
                    value={numberOfServers}
                    onChange={(e) => setNumberOfServers(e.target.value)}
                    placeholder="Nombre de serveurs requis"
                    className={cn(
                      "pl-5 pr-5 h-12 text-base border-2 rounded-xl transition-all duration-300 bg-gray-50 focus:bg-white",
                      errors.numberOfServers
                        ? "border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-100 hover:border-blue-300"
                    )}
                  />
                  {numberOfServers && !errors.numberOfServers && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                </div>
                {errors.numberOfServers && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                    <XCircle className="h-4 w-4 flex-shrink-0" />
                    <p className="text-sm font-medium">
                      {errors.numberOfServers}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Prix par serveur */}
          <Card className="border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Label
                  htmlFor="pricePerServer"
                  className="flex items-center gap-3 text-base font-semibold text-gray-700 group-hover:text-blue-600 transition-colors"
                >
                  <div className="p-2 bg-yellow-50 rounded-lg group-hover:bg-yellow-100 transition-colors">
                    <DollarSign className="h-5 w-5 text-yellow-600" />
                  </div>
                  Prix par serveur (DT)
                </Label>
                <div className="relative">
                  <Input
                    id="pricePerServer"
                    type="number"
                    min="1"
                    value={pricePerServer}
                    onChange={(e) => setPricePerServer(e.target.value)}
                    placeholder="Prix en dinars tunisiens"
                    className={cn(
                      "pl-5 pr-5 h-12 text-base border-2 rounded-xl transition-all duration-300 bg-gray-50 focus:bg-white",
                      errors.pricePerServer
                        ? "border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-100 hover:border-blue-300"
                    )}
                  />
                  {pricePerServer && !errors.pricePerServer && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                </div>{" "}
                {errors.pricePerServer && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                    <XCircle className="h-4 w-4 flex-shrink-0" />
                    <p className="text-sm font-medium">
                      {errors.pricePerServer}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Prix donné aux serveurs */}
          <Card className="border-2 border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Label
                  htmlFor="serverPayAmount"
                  className="flex items-center gap-3 text-base font-semibold text-gray-700 group-hover:text-green-600 transition-colors"
                >
                  <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  Prix donné à chaque serveur (DT)
                </Label>
                <div className="relative">
                  <Input
                    id="serverPayAmount"
                    type="number"
                    min="1"
                    value={serverPayAmount}
                    onChange={(e) => setServerPayAmount(e.target.value)}
                    placeholder="Montant payé à chaque serveur"
                    className={cn(
                      "pl-5 pr-5 h-12 text-base border-2 rounded-xl transition-all duration-300 bg-gray-50 focus:bg-white",
                      errors.serverPayAmount
                        ? "border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50"
                        : "border-gray-200 focus:border-green-500 focus:ring-green-100 hover:border-green-300"
                    )}
                  />
                  {serverPayAmount && !errors.serverPayAmount && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                </div>
                {/* Calcul de la commission en temps réel */}
                {pricePerServer &&
                  serverPayAmount &&
                  !errors.pricePerServer &&
                  !errors.serverPayAmount && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-blue-700 font-medium">
                          Commission par serveur:
                        </span>
                        <span className="text-blue-800 font-bold">
                          {parseInt(pricePerServer) - parseInt(serverPayAmount)}{" "}
                          DT
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-blue-700 font-medium">
                          Commission totale:
                        </span>
                        <span className="text-blue-800 font-bold">
                          {(parseInt(pricePerServer) -
                            parseInt(serverPayAmount)) *
                            parseInt(numberOfServers || "1")}{" "}
                          DT
                        </span>
                      </div>
                    </div>
                  )}
                {errors.serverPayAmount && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                    <XCircle className="h-4 w-4 flex-shrink-0" />
                    <p className="text-sm font-medium">
                      {errors.serverPayAmount}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sélection des serveurs */}
        <Card className="border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Label className="flex items-center gap-3 text-base font-semibold text-gray-700">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                Sélectionner les serveurs ({selectedServerIds.length}/
                {numberOfServers})
              </Label>
              {errors.selectedServers && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                  <XCircle className="h-4 w-4 flex-shrink-0" />
                  <p className="text-sm font-medium">
                    {errors.selectedServers}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                {isLoading ? (
                  <div className="col-span-3 p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">
                      Chargement des serveurs...
                    </p>
                  </div>
                ) : availableServers.length === 0 ? (
                  <div className="col-span-3 p-8 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Aucun serveur disponible
                    </p>
                  </div>
                ) : (
                  availableServers.map((server) => (
                    <Card
                      key={server.id}
                      className={cn(
                        "p-4 cursor-pointer transition-all duration-300 border-2",
                        selectedServerIds.includes(server.id)
                          ? "bg-blue-500 text-white border-blue-600 shadow-lg transform scale-105"
                          : "bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300 hover:shadow-md"
                      )}
                      onClick={() => handleServerSelection(server.id)}
                    >
                      <div className="text-center">
                        <User
                          className={cn(
                            "h-6 w-6 mx-auto mb-2",
                            selectedServerIds.includes(server.id)
                              ? "text-white"
                              : "text-blue-600"
                          )}
                        />
                        <p className="font-medium text-sm">{server.name}</p>
                        {selectedServerIds.includes(server.id) && (
                          <CheckCircle className="h-4 w-4 mx-auto mt-2 text-white" />
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Résumé financier */}
        {numberOfServers && pricePerServer && (
          <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Label className="flex items-center gap-3 text-base font-semibold text-green-700">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  Résumé financier
                </Label>

                {caterer === "prive-sans-traiteur" ? (
                  // Événement privé : Client nous paie directement
                  <>
                    <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>TOTAL FACTURÉ AU CLIENT</strong>
                      </p>
                      <p className="text-xl font-bold text-blue-700">
                        {parseInt(numberOfServers) * parseInt(pricePerServer) ||
                          0}{" "}
                        DT
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {parseInt(numberOfServers)} serveurs ×{" "}
                        {parseInt(pricePerServer)} DT
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg border border-green-200">
                        <p className="text-sm text-muted-foreground mb-1">
                          Total à payer aux serveurs
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          {parseInt(serverPayAmount || "0") *
                            parseInt(numberOfServers)}{" "}
                          DT
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-purple-200">
                        <p className="text-sm text-muted-foreground mb-1">
                          Notre commission
                        </p>
                        <p className="text-lg font-bold text-purple-600">
                          {(parseInt(pricePerServer) -
                            parseInt(serverPayAmount || "0")) *
                            parseInt(numberOfServers)}{" "}
                          DT
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  // Événement avec traiteur : Le traiteur nous paie
                  <>
                    <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>TRAITEUR NOUS PAIE</strong>
                      </p>
                      <p className="text-xl font-bold text-orange-700">
                        {parseInt(numberOfServers) * parseInt(pricePerServer) ||
                          0}{" "}
                        DT
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {numberOfServers} serveurs × {pricePerServer} DT =
                        Calcul automatique
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg border border-green-200">
                        <p className="text-sm text-muted-foreground mb-1">
                          À payer aux serveurs
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          {parseInt(serverPayAmount || "0") *
                            parseInt(numberOfServers)}{" "}
                          DT
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-purple-200">
                        <p className="text-sm text-muted-foreground mb-1">
                          Notre bénéfice
                        </p>
                        <p className="text-lg font-bold text-purple-600">
                          {parseInt(numberOfServers) *
                            parseInt(pricePerServer) -
                            parseInt(serverPayAmount || "0") *
                              parseInt(numberOfServers)}{" "}
                          DT
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        <Card className="border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Label
                htmlFor="notes"
                className="flex items-center gap-3 text-base font-semibold text-gray-700 group-hover:text-blue-600 transition-colors"
              >
                <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                  <FileText className="h-5 w-5 text-gray-600" />
                </div>
                Notes supplémentaires
                <span className="text-xs text-muted-foreground bg-gray-100 px-3 py-1 rounded-full font-medium">
                  Optionnel
                </span>
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Informations complémentaires sur l'événement..."
                rows={4}
                className="border-2 rounded-xl transition-all duration-300 bg-gray-50 focus:bg-white border-gray-200 focus:border-blue-500 hover:border-blue-300"
              />
            </div>
          </CardContent>
        </Card>

        {/* Bouton de soumission */}
        <div className="pt-6">
          <Button
            type="submit"
            disabled={
              !clientName ||
              !eventType ||
              !location ||
              selectedServerIds.length === 0
            }
            className={cn(
              "w-full h-14 text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]",
              !clientName ||
                !eventType ||
                !location ||
                selectedServerIds.length === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700"
            )}
          >
            {initialData?.id ? (
              <>
                <CheckCircle className="h-6 w-6 mr-3" />
                Mettre à jour l'événement
              </>
            ) : (
              <>
                <PartyPopper className="h-6 w-6 mr-3" />
                Créer l'événement
              </>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-4">
            {initialData?.id
              ? "Les modifications seront appliquées immédiatement"
              : "Votre événement sera créé et les serveurs seront notifiés"}
          </p>
        </div>
      </form>
    </div>
  );
}
