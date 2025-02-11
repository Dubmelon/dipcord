
import { Bell, Menu, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NotificationPopover } from "@/components/notifications/NotificationPopover";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ServerQuickActionsProps {
  isMobile: boolean;
  onToggleSidebar: () => void;
}

export const ServerQuickActions = ({ isMobile, onToggleSidebar }: ServerQuickActionsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // For now just show a toast that search is not implemented
    toast({
      title: "Search",
      description: `Searching for "${searchQuery}"...`,
      duration: 2000,
    });
    setSearchOpen(false);
    setSearchQuery("");
  };

  const handleSettingsClick = () => {
    navigate("settings");
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setSearchOpen(true)}>
          <Search className="h-4 w-4" />
        </Button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <NotificationPopover />
          </PopoverContent>
        </Popover>

        <Button variant="ghost" size="icon" onClick={handleSettingsClick}>
          <Settings className="h-4 w-4" />
        </Button>

        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
            <Menu className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Search</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
