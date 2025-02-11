
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Home, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useServers } from "@/components/dashboard/useServers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useServerFolders } from "@/hooks/useServerFolders";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const ServerNavigationSidebar = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { data: servers, isLoading } = useServers();
  const { folders, loadingFolders } = useServerFolders(currentUser?.id);
  const [hoveredServer, setHoveredServer] = useState<string | null>(null);

  const handleServerClick = (serverId: string) => {
    navigate(`/servers/${serverId}`);
  };

  const handleCreateServer = () => {
    navigate("/servers");
    toast("Create a new server from the servers page");
  };

  return (
    <div className="w-[72px] bg-background/80 backdrop-blur-sm border-r border-border h-[calc(100vh-4rem)] flex flex-col">
      {/* Home Button */}
      <Button
        variant="ghost"
        size="icon"
        className="w-12 h-12 rounded-full mx-auto mt-2 mb-2"
        onClick={() => navigate("/dashboard")}
      >
        <Home className="h-5 w-5" />
      </Button>

      <Separator className="mx-2 my-2" />

      {/* Server List */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col items-center gap-2 px-2">
          {!isLoading &&
            servers?.map((server) => (
              <motion.div
                key={server.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
                onMouseEnter={() => setHoveredServer(server.id)}
                onMouseLeave={() => setHoveredServer(null)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-12 h-12 rounded-full relative"
                  onClick={() => handleServerClick(server.id)}
                >
                  <Avatar className="w-full h-full">
                    <AvatarImage src={server.icon_url || ''} />
                    <AvatarFallback>
                      {server.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
                {hoveredServer === server.id && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute left-16 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-border z-50"
                  >
                    <p className="text-sm whitespace-nowrap">{server.name}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
        </div>
      </ScrollArea>

      {/* Bottom Actions */}
      <div className="p-2 flex flex-col gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-full"
          onClick={handleCreateServer}
        >
          <Plus className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-full"
          onClick={() => navigate("/settings")}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
