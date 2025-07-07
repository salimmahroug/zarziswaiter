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
import { Lock, User, Users, Shield, Loader2, Eye, EyeOff, Sparkles } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [titleText, setTitleText] = useState('');
  const fullTitle = 'Bienvenue';
  const [buttonClicked, setButtonClicked] = useState(false);
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

  // Animation d'entrée et effet de typing
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Effet typing pour le titre
    let index = 0;
    const typingTimer = setInterval(() => {
      if (index <= fullTitle.length) {
        setTitleText(fullTitle.slice(0, index));
        index++;
      } else {
        clearInterval(typingTimer);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      clearInterval(typingTimer);
    };
  }, []);

  // Suivre la position de la souris pour l'effet parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Charger la liste des serveurs
  const loadServers = async () => {
    setLoadingServers(true);
    try {
      const data = await getAllServers();
      setServers(data);
    } catch (error) {
      console.error("Erreur lors du chargement des serveurs:", error);
      setError("Impossible de charger la liste des serveurs");
    } finally {
      setLoadingServers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setButtonClicked(true);

    try {
      if (userType === "admin") {
        await authLogin(credentials.username, credentials.password);
      } else {
        if (!selectedServer) {
          setError("Veuillez sélectionner votre nom");
          return;
        }
        // Trouver le serveur sélectionné
        const server = servers.find(s => s.id === selectedServer);
        if (server) {
          await loginAsServer(selectedServer, server.name);
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur de connexion";
      setError(message);
    } finally {
      setIsLoading(false);
      setTimeout(() => setButtonClicked(false), 300);
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-zarzis-primary via-zarzis-primary-light to-zarzis-primary-dark overflow-hidden">
      {/* Fond animé avec particules flottantes et vagues */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Particules flottantes avec effet parallax */}
        <div 
          className="absolute w-20 h-20 bg-white/10 rounded-full top-[10%] left-[10%] animate-bounce transition-transform duration-1000" 
          style={{
            animationDelay: '0s', 
            animationDuration: '6s',
            transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`
          }}
        ></div>
        <div 
          className="absolute w-32 h-32 bg-white/10 rounded-full top-[20%] right-[15%] animate-bounce transition-transform duration-1000" 
          style={{
            animationDelay: '1s', 
            animationDuration: '6s',
            transform: `translate(${mousePosition.x * -15}px, ${mousePosition.y * 15}px)`
          }}
        ></div>
        <div 
          className="absolute w-16 h-16 bg-white/10 rounded-full bottom-[30%] left-[20%] animate-bounce transition-transform duration-1000" 
          style={{
            animationDelay: '2s', 
            animationDuration: '6s',
            transform: `translate(${mousePosition.x * 25}px, ${mousePosition.y * -10}px)`
          }}
        ></div>
        <div 
          className="absolute w-24 h-24 bg-white/10 rounded-full bottom-[20%] right-[20%] animate-bounce transition-transform duration-1000" 
          style={{
            animationDelay: '3s', 
            animationDuration: '6s',
            transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -25}px)`
          }}
        ></div>
        <div 
          className="absolute w-10 h-10 bg-white/10 rounded-full top-[60%] left-[50%] animate-bounce transition-transform duration-1000" 
          style={{
            animationDelay: '4s', 
            animationDuration: '6s',
            transform: `translate(${mousePosition.x * 10}px, ${mousePosition.y * 30}px)`
          }}
        ></div>
        <div 
          className="absolute w-14 h-14 bg-white/10 rounded-full top-[40%] right-[40%] animate-bounce transition-transform duration-1000" 
          style={{
            animationDelay: '2.5s', 
            animationDuration: '6s',
            transform: `translate(${mousePosition.x * -30}px, ${mousePosition.y * 10}px)`
          }}
        ></div>
        
        {/* Vagues animées */}
        <div className="absolute bottom-0 left-0 w-full h-20 opacity-20">
          <svg viewBox="0 0 1200 120" className="w-full h-full">
            <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z" fill="white" className="animate-pulse">
              <animateTransform attributeName="transform" type="translate" values="0;-50;0" dur="4s" repeatCount="indefinite"/>
            </path>
          </svg>
        </div>
        
        {/* Étoiles scintillantes */}
        <div className="absolute w-1 h-1 bg-white rounded-full top-[15%] left-[25%] animate-ping" style={{animationDelay: '0s'}}></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-[35%] left-[75%] animate-ping" style={{animationDelay: '1s'}}></div>
        <div className="absolute w-1 h-1 bg-white rounded-full bottom-[40%] left-[60%] animate-ping" style={{animationDelay: '2s'}}></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-[70%] right-[30%] animate-ping" style={{animationDelay: '3s'}}></div>
      </div>

      {/* Contenu principal */}
      <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
        <Card 
          className={`w-full max-w-md bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl transition-all duration-700 relative overflow-hidden ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'} ${isCardHovered ? 'shadow-3xl shadow-white/30 -translate-y-2 scale-105' : ''}`}
          onMouseEnter={() => setIsCardHovered(true)}
          onMouseLeave={() => setIsCardHovered(false)}
        >
          {/* Effet shimmer sur hover */}
          {isCardHovered && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
          )}
          <CardHeader className="space-y-4 text-center">
            {/* Icône animée avec effet de rotation */}
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-zarzis-primary to-zarzis-primary-light rounded-full flex items-center justify-center shadow-lg animate-breathe relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              <Sparkles className="w-8 h-8 text-white animate-spin" style={{animationDuration: '3s'}} />
            </div>
            
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-zarzis-primary to-zarzis-primary-dark bg-clip-text text-transparent animate-glow min-h-[2.5rem] flex items-center justify-center">
                {titleText}
                <span className="animate-pulse">|</span>
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 animate-float">
                {userType === "admin"
                  ? "Accès à l'administration"
                  : "Espace serveur personnel"}
              </CardDescription>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive" className="animate-shake bg-red-50 border border-red-200 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-100/50 to-red-200/50 animate-pulse"></div>
                  <AlertDescription className="relative z-10 font-medium">{error}</AlertDescription>
                </Alert>
              )}

              {/* Sélecteur de type d'utilisateur avec animations */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Type de connexion</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={userType === "admin" ? "default" : "outline"}
                    onClick={() => {
                      setUserType("admin");
                      setSelectedServer("");
                      setError("");
                    }}
                    className={`transition-all duration-300 relative overflow-hidden group ${
                      userType === "admin" 
                        ? 'bg-gradient-to-r from-zarzis-primary to-zarzis-primary-light text-white shadow-lg -translate-y-1 ring-2 ring-zarzis-primary/30' 
                        : 'hover:bg-zarzis-primary/10 hover:border-zarzis-primary hover:-translate-y-1 hover:shadow-lg'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                  <Button
                    type="button"
                    variant={userType === "server" ? "default" : "outline"}
                    onClick={() => {
                      setUserType("server");
                      setCredentials({ username: "", password: "" });
                      setError("");
                    }}
                    className={`transition-all duration-300 relative overflow-hidden group ${
                      userType === "server" 
                        ? 'bg-gradient-to-r from-zarzis-primary to-zarzis-primary-light text-white shadow-lg -translate-y-1 ring-2 ring-zarzis-primary/30' 
                        : 'hover:bg-zarzis-primary/10 hover:border-zarzis-primary hover:-translate-y-1 hover:shadow-lg'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                    <Users className="w-4 h-4 mr-2" />
                    Serveur
                  </Button>
                </div>
              </div>

              {/* Champs de connexion admin */}
              {userType === "admin" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium">
                      Nom d'utilisateur
                    </Label>
                    <div className="relative">
                      <Input
                        id="username"
                        type="text"
                        placeholder="Votre nom d'utilisateur"
                        value={credentials.username}
                        onChange={(e) =>
                          setCredentials({ ...credentials, username: e.target.value })
                        }
                        onFocus={() => setFocusedField('username')}
                        onBlur={() => setFocusedField(null)}
                        className={`pl-10 transition-all duration-300 focus:border-zarzis-primary focus:ring-2 focus:ring-zarzis-primary/20 focus:-translate-y-1 hover:border-zarzis-primary/50 ${focusedField === 'username' ? 'shadow-lg ring-2 ring-zarzis-primary/30' : ''}`}
                        required
                      />
                      <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === 'username' ? 'text-zarzis-primary' : 'text-gray-400'}`} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Mot de passe
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Votre mot de passe"
                        value={credentials.password}
                        onChange={(e) =>
                          setCredentials({ ...credentials, password: e.target.value })
                        }
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        className={`pl-10 pr-10 transition-all duration-300 focus:border-zarzis-primary focus:ring-2 focus:ring-zarzis-primary/20 focus:-translate-y-1 hover:border-zarzis-primary/50 ${focusedField === 'password' ? 'shadow-lg ring-2 ring-zarzis-primary/30' : ''}`}
                        required
                      />
                      <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === 'password' ? 'text-zarzis-primary' : 'text-gray-400'}`} />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-zarzis-primary transition-all duration-300 hover:scale-110"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Sélection serveur */}
              {userType === "server" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Sélectionner votre nom</Label>
                    <Select
                      value={selectedServer}
                      onValueChange={setSelectedServer}
                      onOpenChange={(open) => {
                        if (open && servers.length === 0) {
                          loadServers();
                        }
                      }}
                    >
                      <SelectTrigger 
                        className={`transition-all duration-300 focus:border-zarzis-primary focus:ring-2 focus:ring-zarzis-primary/20 focus:-translate-y-1 hover:border-zarzis-primary/50 ${focusedField === 'server' ? 'shadow-lg ring-2 ring-zarzis-primary/30' : ''}`}
                        onFocus={() => setFocusedField('server')}
                        onBlur={() => setFocusedField(null)}
                      >
                        <SelectValue placeholder="Choisissez votre nom" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingServers ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Chargement...
                          </div>
                        ) : (
                          servers.map((server) => (
                            <SelectItem key={server.id} value={server.id}>
                              <div className="flex items-center">
                                <User className="w-4 h-4 mr-2" />
                                {server.name}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className={`w-full bg-gradient-to-r from-zarzis-primary to-zarzis-primary-light hover:from-zarzis-primary-dark hover:to-zarzis-primary text-white font-medium py-3 rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl active:scale-95 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${buttonClicked ? 'animate-pulse' : ''}`}
                disabled={
                  isLoading ||
                  (userType === "admin" &&
                    (!credentials.username || !credentials.password)) ||
                  (userType === "server" && !selectedServer)
                }
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <div className="relative z-10 flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span className="animate-pulse">Connexion...</span>
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                      <span className="transition-all duration-300">Se connecter</span>
                    </>
                  )}
                </div>
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
