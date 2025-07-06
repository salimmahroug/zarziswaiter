import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BellIcon, Menu, User } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export function MainHeader() {
  const { toast } = useToast();
  const sidebar = useSidebar();
  const isMobile = useIsMobile();

  // Handler to toggle the sidebar based on device type
  const toggleSidebar = () => {
    if (isMobile) {
      sidebar.setOpenMobile(!sidebar.openMobile);
    } else {
      sidebar.setOpen(!sidebar.open);
    }
  };

  return (
    <header className="sticky top-0 z-10 w-full bg-background border-b px-3 sm:px-4 md:px-6 py-3">
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="text-lg sm:text-xl font-bold text-zarzis-blue truncate">
            Administration
          </h2>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              toast({
                title: "Pas de notifications",
                description: "Vous n'avez aucune notification pour le moment.",
              });
            }}
          >
            <BellIcon className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium hidden md:inline-block">
              Admin
            </span>
            <Button variant="outline" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
