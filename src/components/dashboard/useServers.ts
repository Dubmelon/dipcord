
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

      // Get servers where user is a member
      const { data: memberships, error: membershipError } = await supabase
        .from('server_members')
        .select('server_id')
        .eq('user_id', user.id);

      if (membershipError) {
        console.error("[ServerGrid] Server memberships fetch error:", membershipError);
        throw new Error(`Failed to fetch server memberships: ${membershipError.message}`);
      }

      const serverIds = memberships?.map(m => m.server_id) || [];
      console.log("[ServerGrid] User's server memberships:", serverIds);

      // Fetch all servers user has access to (public or member)
      const { data: servers, error: serverError } = await supabase
        .from('servers')
        .select(`
          id,
          name,
          description,
          avatar_url,
          is_private,
          member_count,
          owner_id
        `);

      if (serverError) {
        console.error("[ServerGrid] Server fetch error:", serverError);
        throw new Error(`Failed to fetch servers: ${serverError.message}`);
      }

      // Add is_member flag to each server
      const serversWithMembership = servers?.map(server => ({
        ...server,
        is_member: serverIds.includes(server.id)
      })) as Server[];

      console.log("[ServerGrid] Servers fetched:", serversWithMembership);
      
      return serversWithMembership || [];
    },
    retry: 1,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Failed to load servers"
    }
  });
};
