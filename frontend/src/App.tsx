import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import Servers from "./pages/Servers";
import ServerEvents from "./pages/ServerEvents";
import ServerPayments from "./pages/ServerPayments";
import ServerDetail from "./pages/ServerDetail";
import { Caterers } from "./pages/Caterers";
import Finances from "./pages/Finances";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <MainLayout>
                <Dashboard />
              </MainLayout>
            }
          />
          <Route
            path="/events"
            element={
              <MainLayout>
                <Events />
              </MainLayout>
            }
          />
          <Route
            path="/servers"
            element={
              <MainLayout>
                <Servers />
              </MainLayout>
            }
          />
          <Route
            path="/server-events"
            element={
              <MainLayout>
                <ServerEvents />
              </MainLayout>
            }
          />
          <Route
            path="/server-payments"
            element={
              <MainLayout>
                <ServerPayments />
              </MainLayout>
            }
          />
          <Route
            path="/servers/:id"
            element={
              <MainLayout>
                <ServerDetail />
              </MainLayout>
            }
          />
          <Route
            path="/caterers"
            element={
              <MainLayout>
                <Caterers />
              </MainLayout>
            }
          />
          <Route
            path="/finances"
            element={
              <MainLayout>
                <Finances />
              </MainLayout>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
