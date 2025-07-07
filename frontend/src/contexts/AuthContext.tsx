import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  username: string;
  role: string;
  serverId?: string;
  serverName?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => boolean;
  loginAsServer: (serverId: string, serverName: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté au chargement
    const storedAuth = localStorage.getItem("isAuthenticated");
    const storedUser = localStorage.getItem("user");

    if (storedAuth === "true" && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    // Vérification des identifiants
    if (username === "zarziswaiter" && password === "zarziswaiter2024") {
      const userData = { username: "zarziswaiter", role: "admin" };

      setIsAuthenticated(true);
      setUser(userData);

      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("user", JSON.stringify(userData));

      return true;
    }
    return false;
  };

  const loginAsServer = (serverId: string, serverName: string) => {
    const userData = { 
      username: serverName, 
      role: "server",
      serverId: serverId,
      serverName: serverName 
    };

    setIsAuthenticated(true);
    setUser(userData);

    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, loginAsServer, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
