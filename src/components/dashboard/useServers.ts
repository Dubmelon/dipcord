
import { useQuery } from "@tanstack/react-query";
import { Server } from "./types";
import { supabase } from "@/integrations/supabase/client";

export const useServers = () => {
  return useQuery({
    queryKey: ['user-servers'],
    queryFn: async () => {
      console.log('[useServers] Fetching servers');
      
      const { data: servers, error } = await supabase
        .from('servers')
        .select(`
          id,
          name,
          description,
          icon_url,
          banner_url,
          is_private,
          member_count,
          owner_id
        `)
        .order('name');

      if (error) {
        console.error('[useServers] Error fetching servers:', error);
        throw error;
      }

      console.log('[useServers] Fetched servers:', servers);
      return servers as Server[];
    }
  });
};
