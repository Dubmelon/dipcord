
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCallback, useEffect } from "react";

interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
  created_at: string;
  updated_at: string;
  server_id: string;
  description: string | null;
}

export const useChannelData = (serverId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: channels, isLoading } = useQuery({
    queryKey: ['channels', serverId],
    queryFn: async () => {
      console.log(`[ServerView] Fetching channels for server: ${serverId}`);
      const startTime = performance.now();

      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('server_id', serverId)
        .order('type', { ascending: false })
        .order('name', { ascending: true });
      
      if (error) {
        console.error('[ServerView] Channels fetch error:', error);
        throw error;
      }

      const endTime = performance.now();
      console.log(`[ServerView] Channels fetch completed in ${(endTime - startTime).toFixed(2)}ms. Found ${data?.length} channels`);
      
      return data?.map(channel => ({
        ...channel,
        type: channel.type === 'voice' ? 'voice' : 'text'
      } as Channel)) || [];
    },
    enabled: !!serverId,
    staleTime: 30000,
    meta: {
      errorMessage: "Failed to load channels"
    }
  });

  const setupRealtimeSubscription = useCallback(() => {
    if (!serverId) return;

    console.log('[ServerView] Setting up realtime subscription for channels');
    const channel = supabase
      .channel(`channels-${serverId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'channels',
          filter: `server_id=eq.${serverId}`,
        },
        (payload) => {
          console.log('[ServerView] Realtime channel update received:', payload);
          queryClient.invalidateQueries({ queryKey: ['channels', serverId] });
        }
      )
      .subscribe((status) => {
        console.log(`[ServerView] Channel subscription status: ${status}`);
      });

    return () => {
      console.log('[ServerView] Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [serverId, queryClient]);

  useEffect(() => {
    const cleanup = setupRealtimeSubscription();
    return () => {
      if (cleanup) cleanup();
    };
  }, [setupRealtimeSubscription]);

  return { channels, isLoading };
};
