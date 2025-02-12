
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { NotificationCard } from "./NotificationCard";
import { ServerCard } from "../servers/ServerCard";
import { useServers } from "./useServers";
import { container } from "./animations";
import { useAuth } from "@/hooks/useAuth";

export const ServerGrid = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();
  const { data: servers, isLoading, error } = useServers();
  const { currentUser } = useAuth();

  if (error) {
    console.error("[ServerGrid] Rendering error state:", error);
    toast.error("Failed to load servers. Please try again.");
    
    return (
      <Card className="w-full max-w-5xl mx-auto">
        <div className="p-8 text-center space-y-4">
          <p className="text-red-500">Failed to load servers: {error.message}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-5xl mx-auto bg-background/80 backdrop-blur-sm border-border shadow-lg">
      <motion.div 
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
        transition={{ duration: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Users className="h-5 w-5" />
          Your Servers
        </h2>
        <Button variant="ghost" size="icon" className="shrink-0">
          {isExpanded ? <ChevronUp /> : <ChevronDown />}
        </Button>
      </motion.div>
      <AnimatePresence>
        {isExpanded && (
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : servers?.length === 0 ? (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-muted-foreground py-8"
              >
                You haven't joined any servers yet
              </motion.p>
            ) : (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2"
              >
                <NotificationCard />
                {servers?.map((server) => (
                  <ServerCard 
                    key={server.id} 
                    server={server}
                    currentUserId={currentUser?.id || ''}
                  />
                ))}
              </motion.div>
            )}
          </CardContent>
        )}
      </AnimatePresence>
    </Card>
  );
};
