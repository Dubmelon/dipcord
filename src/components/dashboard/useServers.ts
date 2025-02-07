
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Server } from "./types";
import { toast } from "sonner";

export const useServers = () => {
  const navigate = useNavigate();

  return useQuery({
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

      // Fetch all accessible servers in a single query
      const { data: servers, error: serverError } = await supabase
        .from('servers')
        .select(`
          id,
          name,
          description,
          avatar_url,
          is_private,
          member_count,
          owner_id,
          server_members!inner (
            user_id
          )
        `)
        .or(`is_private.eq.false,owner_id.eq.${user.id},server_members.user_id.eq.${user.id}`);

      if (serverError) {
        console.error("[ServerGrid] Server fetch error:", serverError);
        throw new Error(`Failed to fetch servers: ${serverError.message}`);
      }

      // Process the results to add is_member flag
      const processedServers = servers?.map(server => ({
        id: server.id,
        name: server.name,
        description: server.description,
        avatar_url: server.avatar_url,
        is_private: server.is_private,
        member_count: server.member_count,
        owner_id: server.owner_id,
        is_member: server.server_members.some(member => member.user_id === user.id)
      })) as Server[];

      console.log("[ServerGrid] Servers fetched:", processedServers);
      
      return processedServers || [];
    },
    retry: 1,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Failed to load servers"
    }
  });
};
