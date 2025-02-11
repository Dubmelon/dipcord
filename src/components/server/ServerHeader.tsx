
import { motion } from "framer-motion";
import { Bell, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServerBanner } from "./ServerBanner";
import { ServerQuickActions } from "./ServerQuickActions";
import { ServerStatusBar } from "./ServerStatusBar";
import type { Server } from "@/types/database";

interface ServerHeaderProps {
  server: Server;
  isMobile: boolean;
  onToggleSidebar: () => void;
}

export const ServerHeader = ({ server, isMobile, onToggleSidebar }: ServerHeaderProps) => {
  return (
    <div className="relative w-full">
      <ServerBanner url={server.banner_url} serverName={server.name} />
      
      <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-gradient-to-t from-background/80 to-transparent backdrop-blur-sm">
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

          <ServerQuickActions isMobile={isMobile} onToggleSidebar={onToggleSidebar} />
        </div>
        <ServerStatusBar server={server} />
      </div>
    </div>
  );
};
