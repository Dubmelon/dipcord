
import { Bell, Menu, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServerQuickActionsProps {
  isMobile: boolean;
  onToggleSidebar: () => void;
}

export const ServerQuickActions = ({ isMobile, onToggleSidebar }: ServerQuickActionsProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" className="hidden md:flex">
        <Search className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon">
        <Bell className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon">
        <Settings className="h-4 w-4" />
      </Button>
      {isMobile && (
        <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
          <Menu className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
