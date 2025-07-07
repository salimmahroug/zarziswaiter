import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ServerDashboard from "./pages/ServerDashboard";
import Events from "./pages/Events";
import Servers from "./pages/Servers";
import ServerEvents from "./pages/ServerEvents";
import ServerPayments from "./pages/ServerPayments";
import ServerDetail from "./pages/ServerDetail";
import { Caterers } from "./pages/Caterers";
import Finances from "./pages/Finances";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Composant pour rediriger selon le rôle de l'utilisateur
  const RoleBasedRedirect = () => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (user?.role === "server") {
      return <Navigate to="/server-dashboard" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<RoleBasedRedirect />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/server-dashboard"
                element={
                  <ProtectedRoute serverOnly={true}>
                    <ServerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <MainLayout>
                      <Events />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/servers"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <MainLayout>
                      <Servers />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/server-events"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <MainLayout>
                      <ServerEvents />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/server-payments"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <MainLayout>
                      <ServerPayments />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/servers/:id"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <MainLayout>
                      <ServerDetail />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/caterers"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <MainLayout>
                      <Caterers />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/finances"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <MainLayout>
                      <Finances />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
