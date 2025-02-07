
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, ChevronUp, Loader2, Bell, Users, Calendar, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NotificationPopover } from "@/components/notifications/NotificationPopover";
import { toast } from "sonner";

interface Server {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export const ServerGrid = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();

  const { data: servers, isLoading, error } = useQuery({
    queryKey: ['user-servers'],
    queryFn: async () => {
      console.log("[ServerGrid] Starting server fetch process...");
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("[ServerGrid] Authentication error:", authError);
        throw new Error(`Authentication failed: ${authError.message}`);
      }
      
      if (!user) {
        console.log("[ServerGrid] No authenticated user found");
        navigate("/");
        throw new Error("Not authenticated");
      }

      console.log("[ServerGrid] Authenticated user ID:", user.id);

      // First check if user has a profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error("[ServerGrid] Profile fetch error:", profileError);
        throw new Error(`Failed to fetch profile: ${profileError.message}`);
      }

      if (!profile) {
        console.log("[ServerGrid] Creating profile for user...");
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert([{ 
            id: user.id,
            username: user.email?.split('@')[0] || 'user',
            is_online: true
          }]);

        if (createProfileError) {
          console.error("[ServerGrid] Profile creation error:", createProfileError);
          throw new Error(`Failed to create profile: ${createProfileError.message}`);
        }
      }

      console.log("[ServerGrid] Fetching server memberships...");
      const { data: memberships, error: membershipError } = await supabase
        .from('server_members')
        .select(`
          server:servers (
            id,
            name,
            description,
            avatar_url
          )
        `)
        .eq('user_id', user.id);

      if (membershipError) {
        console.error("[ServerGrid] Server membership fetch error:", membershipError);
        throw new Error(`Failed to fetch server memberships: ${membershipError.message}`);
      }

      console.log("[ServerGrid] Server memberships fetched:", memberships);
      
      // Additional validation of the returned data
      const validServers = memberships
        .filter(item => item.server)
        .map(item => item.server as Server);
      
      console.log("[ServerGrid] Processed valid servers:", validServers);
      return validServers;
    },
    retry: 1,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Failed to load servers"
    }
  });

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

  const handleServerClick = (serverId: string) => {
    console.log("[ServerGrid] Navigating to server:", serverId);
    navigate(`/servers/${serverId}`);
  };

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
                <Popover>
                  <PopoverTrigger asChild>
                    <motion.div
                      variants={item}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative bg-card hover:bg-accent/10 transition-all duration-200 rounded-lg shadow-sm cursor-pointer p-6"
                    >
                      <Bell className="h-5 w-5 mb-4 text-foreground" />
                      <h3 className="text-xl font-semibold mb-2 text-foreground">Notifications</h3>
                      <p className="text-sm text-muted-foreground">
                        Check your latest notifications and updates
                      </p>
                    </motion.div>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="start">
                    <NotificationPopover />
                  </PopoverContent>
                </Popover>
                {servers?.map((server) => (
                  <motion.button
                    key={server.id}
                    variants={item}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleServerClick(server.id)}
                    className="group relative flex flex-col p-6 rounded-lg bg-card hover:bg-accent/10 transition-all duration-200 text-left"
                  >
                    <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                      {server.name}
                    </h3>
                    {server.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {server.description}
                      </p>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </CardContent>
        )}
      </AnimatePresence>
    </Card>
  );
};
