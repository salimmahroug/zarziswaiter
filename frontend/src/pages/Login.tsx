import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, User, Users, Shield, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllServers } from "@/services/serverService";
import { Server } from "@/types";

const Login = () => {
  const { login: authLogin, loginAsServer, isAuthenticated, user } = useAuth();
  const [userType, setUserType] = useState<"admin" | "server">("admin");
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [selectedServer, setSelectedServer] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [servers, setServers] = useState<Server[]>([]);
  const [loadingServers, setLoadingServers] = useState(false);
  const navigate = useNavigate();

  // Rediriger si l'utilisateur est déjà connecté
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "server") {
        navigate("/server-dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Charger la liste des serveurs au montage du composant
  useEffect(() => {
    const fetchServers = async () => {
      if (userType === "server") {
        setLoadingServers(true);
        try {
          const serversList = await getAllServers();
          setServers(serversList);
        } catch (error) {
          console.error("Erreur lors du chargement des serveurs:", error);
          setError(
            "Impossible de charger la liste des serveurs. Veuillez réessayer."
          );
        } finally {
          setLoadingServers(false);
        }
      }
    };

    fetchServers();
  }, [userType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (userType === "admin") {
      // Vérification des identifiants admin via le contexte
      const loginSuccess = authLogin(
        credentials.username,
        credentials.password
      );

      if (loginSuccess) {
        navigate("/dashboard");
      } else {
        setError("Identifiants admin incorrects. Veuillez réessayer.");
      }
    } else {
      // Connexion serveur via le contexte
      if (selectedServer) {
        const server = servers.find((s) => s.id === selectedServer);

        if (server) {
          loginAsServer(server.id, server.name);
          navigate("/server-dashboard");
        } else {
          setError("Serveur non trouvé.");
        }
      } else {
        setError("Veuillez sélectionner votre nom.");
      }
    }

    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="text-2xl font-bold text-blue-600">
              ZARZIS WAITER
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Connexion</CardTitle>
          <CardDescription className="text-center">
            {userType === "admin"
              ? "Accès administration"
              : "Sélectionnez votre nom pour accéder à votre espace"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Sélecteur de type d'utilisateur */}
            <div className="space-y-3">
              <Label>Type de connexion</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={userType === "admin" ? "default" : "outline"}
                  onClick={() => {
                    setUserType("admin");
                    setSelectedServer("");
                    setError("");
                  }}
                  className="h-12 flex flex-col gap-1"
                >
                  <Shield className="h-4 w-4" />
                  <span className="text-xs">Admin</span>
                </Button>
                <Button
                  type="button"
                  variant={userType === "server" ? "default" : "outline"}
                  onClick={() => {
                    setUserType("server");
                    setCredentials({ username: "", password: "" });
                    setSelectedServer("");
                    setError("");
                  }}
                  className="h-12 flex flex-col gap-1"
                >
                  <Users className="h-4 w-4" />
                  <span className="text-xs">Serveur</span>
                </Button>
              </div>
            </div>

            {/* Formulaire Admin */}
            {userType === "admin" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">Nom d'utilisateur</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="zarziswaiter"
                      value={credentials.username}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••••••"
                      value={credentials.password}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Formulaire Serveur */}
            {userType === "server" && (
              <div className="space-y-2">
                <Label htmlFor="serverSelect">Sélectionnez votre nom</Label>
                {loadingServers ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-gray-500">
                      Chargement des serveurs...
                    </span>
                  </div>
                ) : servers.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      Aucun serveur trouvé. Contactez l'administrateur pour
                      ajouter des serveurs.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Select
                    value={selectedServer}
                    onValueChange={setSelectedServer}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisissez votre nom dans la liste" />
                    </SelectTrigger>
                    <SelectContent>
                      {servers.map((server) => (
                        <SelectItem key={server.id} value={server.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{server.name}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              {server.available ? "Disponible" : "Indisponible"}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={
                isLoading ||
                loadingServers ||
                (userType === "server" &&
                  (!selectedServer || servers.length === 0))
              }
            >
              {isLoading
                ? "Connexion..."
                : loadingServers
                ? "Chargement..."
                : userType === "admin"
                ? "Se connecter"
                : "Accéder à mon espace"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
