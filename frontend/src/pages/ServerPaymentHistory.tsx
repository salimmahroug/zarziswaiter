import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { serverService } from "@/services/serverService";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowLeft,
  User,
  History,
  DollarSign,
  Clock,
  Filter,
  Download,
  Calendar,
  FileText,
  Search,
  CreditCard,
  Wallet,
  TrendingDown,
} from "lucide-react";

export default function ServerPaymentHistory() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterMethod, setFilterMethod] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");

  const {
    data: server,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["server", id],
    queryFn: () => serverService.getServerById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  if (isError || !server) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-destructive">
            Erreur lors du chargement de l'historique
          </p>
          <Button onClick={() => navigate("/servers")} className="mt-4">
            Retour aux serveurs
          </Button>
        </div>
      </div>
    );
  }
  // Calculer les statistiques
  const totalPaid =
    server.totalPayments ||
    server.payments?.reduce((sum, payment) => sum + payment.amount, 0) ||
    0;
  const remainingAmount = server.totalEarnings || 0;
  const originalTotalEarnings =
    server.totalEarningsOriginal || remainingAmount + totalPaid;

  console.log("Historique des paiements - Montants:", {
    totalPayments: totalPaid,
    remaining: remainingAmount,
    original: originalTotalEarnings,
  });

  // Filtrer et trier les paiements
  const filteredPayments =
    server.payments
      ?.filter((payment) => {
        const matchesSearch =
          payment.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          payment.amount.toString().includes(searchQuery);
        const matchesMethod =
          filterMethod === "all" || payment.paymentMethod === filterMethod;
        return matchesSearch && matchesMethod;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
      }) || [];

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "cash":
        return {
          label: "💵 Espèces",
          color: "bg-green-100 text-green-800 border-green-200",
        };
      case "transfer":
        return {
          label: "🏦 Virement",
          color: "bg-blue-100 text-blue-800 border-blue-200",
        };
      case "check":
        return {
          label: "📝 Chèque",
          color: "bg-purple-100 text-purple-800 border-purple-200",
        };
      case "other":
        return {
          label: "🔗 Autre",
          color: "bg-gray-100 text-gray-800 border-gray-200",
        };
      default:
        return {
          label: method,
          color: "bg-gray-100 text-gray-800 border-gray-200",
        };
    }
  };

  const exportToCSV = () => {
    const csvData = [
      ["Date", "Montant", "Méthode", "Restant", "Notes"],
      ...filteredPayments.map((payment) => [
        format(new Date(payment.date), "dd/MM/yyyy HH:mm"),
        payment.amount,
        payment.paymentMethod || "cash",
        payment.remaining,
        payment.notes || "",
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `paiements_${server.name}_${format(
      new Date(),
      "dd-MM-yyyy"
    )}.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête avec navigation */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(`/servers/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full">
            <History className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Historique des paiements</h1>
            <p className="text-muted-foreground">{server.name}</p>
          </div>
        </div>
      </div>
      {/* Statistiques en résumé */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm text-muted-foreground">Gains totaux</p>
            <p className="text-xl font-bold text-blue-600">
              {originalTotalEarnings} DT
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">Argent reçu</p>
            <p className="text-xl font-bold text-green-600">{totalPaid} DT</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingDown className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-sm text-muted-foreground">Reste à payer</p>
            <p className="text-xl font-bold text-orange-600">
              {remainingAmount} DT
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <History className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-sm text-muted-foreground">Paiements</p>
            <p className="text-xl font-bold text-purple-600">
              {server.payments?.length || 0}
            </p>
          </CardContent>
        </Card>
      </div>
      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres et recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Rechercher</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Montant ou notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="method">Méthode de paiement</Label>
              <Select value={filterMethod} onValueChange={setFilterMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les méthodes</SelectItem>
                  <SelectItem value="cash">💵 Espèces</SelectItem>
                  <SelectItem value="transfer">🏦 Virement</SelectItem>
                  <SelectItem value="check">📝 Chèque</SelectItem>
                  <SelectItem value="other">🔗 Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sort">Trier par date</Label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Plus récent en premier</SelectItem>
                  <SelectItem value="asc">Plus ancien en premier</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={exportToCSV}
                variant="outline"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>{" "}
      {/* Liste des paiements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historique complet ({filteredPayments.length} paiement
              {filteredPayments.length !== 1 ? "s" : ""})
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">
                Aucun paiement trouvé
              </h3>
              <p className="text-sm">
                {server.payments?.length === 0
                  ? "Ce serveur n'a encore reçu aucun paiement"
                  : "Aucun paiement ne correspond aux critères de recherche"}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate("/server-payments")}
              >
                Effectuer un paiement
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment, index) => {
                const methodInfo = getPaymentMethodLabel(
                  payment.paymentMethod || "cash"
                );
                return (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors animate-fadeIn"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          <span className="text-xl font-bold text-green-600">
                            {payment.amount} DT
                          </span>
                        </div>
                        <Badge className={`${methodInfo.color} border`}>
                          {methodInfo.label}
                        </Badge>
                        <span className="text-xs ml-auto text-muted-foreground hidden sm:block">
                          #{filteredPayments.length - index}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <div>
                            <p className="font-medium">
                              {format(new Date(payment.date), "dd MMMM yyyy", {
                                locale: fr,
                              })}
                            </p>
                            <p className="text-xs">
                              {format(new Date(payment.date), "HH:mm", {
                                locale: fr,
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4" />
                          <div>
                            <p className="font-medium">
                              Restant après paiement
                            </p>
                            <p className="text-xs font-semibold text-orange-600">
                              {payment.remaining} DT
                            </p>
                          </div>
                        </div>

                        {payment.notes && (
                          <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 mt-0.5" />
                            <div>
                              <p className="font-medium">Notes</p>
                              <p className="text-xs italic">
                                "{payment.notes}"
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
