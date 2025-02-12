
import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServerBanner } from "./ServerBanner";
import { ServerQuickActions } from "./ServerQuickActions";
import { ServerStatusBar } from "./ServerStatusBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Server } from "@/types/database";

interface ServerHeaderProps {
  server: Server;
  isMobile: boolean;
  onToggleSidebar: () => void;
}

export const ServerHeader = ({ server, isMobile, onToggleSidebar }: ServerHeaderProps) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isOwner = currentUser?.id === server.owner_id;

  const leaveServer = useMutation({
    mutationFn: async () => {
      if (!currentUser?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from('server_members')
        .delete()
        .eq('server_id', server.id)
        .eq('user_id', currentUser.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      toast.success("Left server successfully");
      navigate('/servers');
    },
    onError: (error) => {
      console.error('Error leaving server:', error);
      toast.error("Failed to leave server");
    }
  });

  return (
    <div className="relative w-full">
      <ServerBanner url={server.banner_url} serverName={server.name} />
      
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/80 to-transparent backdrop-blur-sm">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              {server.icon_url && (
                <motion.img
                  src={server.icon_url}
                  alt={`${server.name} icon`}
                  className="w-12 h-12 rounded-full border-2 border-background shadow-lg hover:scale-105 transition-transform"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                />
              )}
              <div>
                <h1 className="text-xl font-bold">{server.name}</h1>
                <p className="text-sm text-muted-foreground">{server.member_count} members</p>
              </div>
            </motion.div>

            <div className="flex items-center gap-2">
              <ServerQuickActions isMobile={isMobile} onToggleSidebar={onToggleSidebar} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isOwner ? (
                    <DropdownMenuItem onClick={() => navigate(`/servers/${server.id}/settings`)}>
                      Server Settings
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => navigate(`/servers/${server.id}/user-settings`)}>
                        User Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => leaveServer.mutate()}
                        className="text-red-600 focus:text-red-600"
                      >
                        Leave Server
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <ServerStatusBar server={server} />
        </div>
      </div>
    </div>
  );
};
