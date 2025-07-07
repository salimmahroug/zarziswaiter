import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  serverOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  adminOnly = false,
  serverOnly = false,
}) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si c'est une route admin seulement et l'utilisateur n'est pas admin
  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/server-dashboard" replace />;
  }

  // Si c'est une route serveur seulement et l'utilisateur n'est pas serveur
  if (serverOnly && user?.role !== "server") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
