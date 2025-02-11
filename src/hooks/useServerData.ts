
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Server, Profile } from "@/types/database";

interface ServerData extends Omit<Server, 'owner'> {
  owner: Profile;
}

export const useServerData = (serverId: string | undefined) => {
  return useQuery({
    queryKey: ['server', serverId],
    queryFn: async () => {
      console.log(`[ServerView] Fetching server details for ID: ${serverId}`);
      const startTime = performance.now();

      const { data: server, error } = await supabase
        .from('servers')
        .select(`
          id,
          name,
          description,
          icon_url,
          banner_url,
          member_count,
          settings_id,
          created_at,
          updated_at,
          owner:owner_id (
            id,
            username,
            avatar_url,
            full_name,
            bio,
            is_online,
            last_seen
          )
        `)
        .eq('id', serverId)
        .single();

      if (error) {
        console.error('[ServerView] Error fetching server:', error);
        throw error;
      }

      if (!server) {
        throw new Error("Server not found");
      }

      const endTime = performance.now();
      console.log(`[ServerView] Server fetch completed in ${(endTime - startTime).toFixed(2)}ms:`, server);
      
      return server as ServerData;
    },
    enabled: !!serverId,
    staleTime: 30000,
    meta: {
      errorMessage: "Failed to load server details"
    }
  });
};
