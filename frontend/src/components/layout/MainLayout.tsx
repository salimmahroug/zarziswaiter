import React from "react";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { MainSidebar } from "./MainSidebar";
import { MainHeader } from "./MainHeader";
import { MobileNav } from "./MobileNav";
import { Toaster } from "@/components/ui/toaster";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <MainLayoutContent>{children}</MainLayoutContent>
    </SidebarProvider>
  );
};

// Composant séparé qui utilise le hook useSidebar
const MainLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const sidebar = useSidebar();
  const isMobile = useIsMobile();

  // Gestionnaire pour fermer la sidebar en cliquant sur l'overlay
  const handleBackdropClick = () => {
    sidebar.setOpenMobile(false);
  };

  return (
    <div
      className={`min-h-screen flex w-full relative ${
        sidebar.openMobile ? "sidebar-open" : ""
      }`}
    >
      {/* Sidebar backdrop overlay for mobile - clicking it closes the sidebar */}
      {isMobile && sidebar.openMobile && (
        <div className="sidebar-backdrop" onClick={handleBackdropClick} />
      )}

      <MainSidebar />
      <div className="flex-1 flex flex-col w-full">
        <MainHeader />
        <main className="flex-1 p-3 sm:p-4 md:p-6 pb-16 md:pb-6 overflow-auto">
          {children}
        </main>
        {isMobile && <MobileNav />}
      </div>
      <Toaster />
    </div>
  );
};
