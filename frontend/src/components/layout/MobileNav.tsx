import React from "react";
import {
  Home,
  Calendar,
  Users,
  History,
  CreditCard,
  ChefHat,
  DollarSign,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";

// Footer navigation pour mobile uniquement - plus facile à utiliser avec le pouce
export function MobileNav() {
  const { setOpenMobile } = useSidebar();

  const closeSidebar = () => {
    setOpenMobile(false);
  };

  const navItems = [
    { icon: Home, label: "Accueil", to: "/" },
    { icon: Calendar, label: "Événements", to: "/events" },
    { icon: Users, label: "Serveurs", to: "/servers" },
    { icon: History, label: "Historique", to: "/server-events" },
    { icon: DollarSign, label: "Finances", to: "/finances" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40 md:hidden">
      <div className="flex justify-around items-center">
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.to}
            onClick={closeSidebar}
            className={({ isActive }) => `
              flex flex-col items-center justify-center py-2 px-1
              ${isActive ? "text-primary" : "text-muted-foreground"}
            `}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] mt-1">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
