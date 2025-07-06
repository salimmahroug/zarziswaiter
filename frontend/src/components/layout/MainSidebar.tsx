import {
  Calendar,
  DollarSign,
  Home,
  Menu,
  Users,
  ChefHat,
  History,
  CreditCard,
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

// Menu items
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Événements",
    url: "/events",
    icon: Calendar,
  },
  {
    title: "Serveurs",
    url: "/servers",
    icon: Users,
  },
  {
    title: "Historique Serveurs",
    url: "/server-events",
    icon: History,
  },
  {
    title: "Paiements Serveurs",
    url: "/server-payments",
    icon: CreditCard,
  },
  {
    title: "Traiteurs",
    url: "/caterers",
    icon: ChefHat,
  },
  {
    title: "Finances",
    url: "/finances",
    icon: DollarSign,
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
    <Sidebar className="z-20 shadow-lg">
      <SidebarRail />
      <SidebarHeader className="px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold golden-gradient truncate">
            ZARZIS WAITER
          </h2>
          <SidebarTrigger className="ml-2 text-white">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Sidebar</span>
          </SidebarTrigger>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 font-medium">
            Menu
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
                        isActive
                          ? "text-sidebar-foreground font-medium"
                          : "text-sidebar-foreground/80"
                      }
                      end
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-4 py-3">
        <div className="text-sidebar-foreground/70 text-xs">
          © 2024 Zarzis Waiter
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
