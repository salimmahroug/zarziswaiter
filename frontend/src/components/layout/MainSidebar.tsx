import {
  Calendar,
  DollarSign,
  Home,
  Menu,
  Users,
  ChefHat,
  History,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import Logo from "@/components/ui/Logo";
import "@/styles/modern-sidebar.css";

// Menu items avec descriptions et badges
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    description: "Vue d'ensemble",
    badge: null,
  },
  {
    title: "Événements",
    url: "/events",
    icon: Calendar,
    description: "Gestion des événements",
    badge: null,
  },
  {
    title: "Serveurs",
    url: "/servers",
    icon: Users,
    description: "Équipe de service",
    badge: null,
  },
  {
    title: "Historique Serveurs",
    url: "/server-events",
    icon: History,
    description: "Suivi des prestations",
    badge: null,
  },
  {
    title: "Paiements Serveurs",
    url: "/server-payments",
    icon: CreditCard,
    description: "Gestion des salaires",
    badge: "NEW",
  },
  {
    title: "Traiteurs",
    url: "/caterers",
    icon: ChefHat,
    description: "Partenaires culinaires",
    badge: null,
  },
  {
    title: "Finances",
    url: "/finances",
    icon: DollarSign,
    description: "Analyse financière",
    badge: null,
  },
];

export function MainSidebar() {
  const { isMobile, setOpenMobile } = useSidebar();

  const closeSidebar = () => {
    // Use the sidebar context to properly close the sidebar on mobile
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar className="z-20">
      <SidebarRail />
      <SidebarHeader>
        <div className="flex items-center">
          <Logo 
            size="md" 
            variant="white" 
            showText={true}
            className="flex-1"
          />
        </div>
        <div className="mt-2 text-white/60 text-xs">
          Gestion d'événements premium
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            Navigation Principale
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      onClick={closeSidebar}
                      className={({ isActive }) =>
                        `flex items-center gap-3 w-full ${
                          isActive
                            ? "text-white font-semibold"
                            : "text-white/80 hover:text-white"
                        }`
                      }
                      end
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.title}</div>
                        <div className="text-xs text-white/50 truncate">{item.description}</div>
                      </div>
                      {item.badge && (
                        <span className="sidebar-badge">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="text-center space-y-1">
          <div className="text-white/60 text-xs font-medium">
            © 2024 Zarzis Waiter
          </div>
          <div className="text-white/40 text-xs">
            Version 2.0 • Premium Edition
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
