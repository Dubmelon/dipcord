
import { motion } from "framer-motion";
import { Server } from "./types";
import { item } from "./animations";
import { Shield, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServerCardProps {
  server: Server;
  onClick: (serverId: string) => void;
}

export const ServerCard = ({ server, onClick }: ServerCardProps) => {
  const isOwner = server.owner_id === server.currentUserId;

  return (
    <motion.button
      variants={item}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(server.id)}
      className="group relative flex flex-col p-6 rounded-lg bg-card hover:bg-accent/10 transition-all duration-200 text-left"
    >
      <div className="flex items-start gap-4">
        {server.avatar_url ? (
          <img 
            src={server.avatar_url} 
            alt={server.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
            <span className="text-lg font-semibold">
              {server.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
              {server.name}
            </h3>
            {server.is_private && (
              <Shield className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          {server.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {server.description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-4">
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {server.member_count} members
            </span>
            <span className={cn(
              "text-sm",
              isOwner ? "text-primary" : "text-muted-foreground"
            )}>
              {isOwner ? "Owner" : "Member"}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
};
