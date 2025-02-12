
import { motion } from "framer-motion";
import { Server } from "./types";
import { item } from "./animations";
import { Shield, Users, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

interface ServerCardProps {
  server: Server;
  currentUserId: string;
}

export const ServerCard = ({ server, currentUserId }: ServerCardProps) => {
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);
  const isOwner = server.owner_id === currentUserId;
  const isMember = server.is_member;

  const handleJoinServer = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking join button
    
    if (isJoining || isMember) return;
    
    try {
      setIsJoining(true);
      
      const { error } = await supabase
        .from('server_members')
        .insert([
          {
            server_id: server.id,
            user_id: currentUserId,
          }
        ]);

      if (error) throw error;

      toast.success(`Joined ${server.name}`);
      navigate(`/servers/${server.id}`);
    } catch (error) {
      console.error('[ServerCard] Error joining server:', error);
      toast.error("Failed to join server");
    } finally {
      setIsJoining(false);
    }
  };

  const handleClick = () => {
    if (isMember) {
      navigate(`/servers/${server.id}`);
    }
  };

  return (
    <motion.div
      variants={item}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={cn(
        "group relative flex flex-col p-6 rounded-lg bg-card hover:bg-accent/10 transition-all duration-200",
        isMember && "cursor-pointer"
      )}
    >
      <div className="flex items-start gap-4">
        {server.icon_url ? (
          <img 
            src={server.icon_url} 
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
            {isOwner ? (
              <span className="text-sm text-primary">Owner</span>
            ) : isMember ? (
              <span className="text-sm text-muted-foreground">Member</span>
            ) : (
              <Button 
                size="sm" 
                onClick={handleJoinServer}
                disabled={isJoining}
              >
                {isJoining ? (
                  "Joining..."
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Join Server
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
