
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  const { data: channels, isLoading, error } = useQuery({
    queryKey: ['channels', serverId],
    queryFn: async () => {
      console.log(`[ServerView] Fetching channels for server: ${serverId}`);
      const startTime = performance.now();

      if (!serverId) {
        throw new Error("Server ID is required");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Authentication required");
      }

      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('server_id', serverId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[ServerView] Channel fetch error:', error);
        throw new Error(error.message);
      }

      const endTime = performance.now();
      console.log(`[ServerView] Channels fetch completed in ${(endTime - startTime).toFixed(2)}ms. Found ${data.length} channels`);
      
      return data as Channel[];
    },
    enabled: !!serverId,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Only retry network-related errors, not auth errors
      if (error instanceof Error && error.message.includes('Authentication')) {
        return false;
      }
      return failureCount < 3;
    },
    meta: {
      errorMessage: "Failed to load channels"
    }
  });

  // Set up realtime subscription for channels
  useEffect(() => {
    if (!serverId) return;

    console.log('[ServerView] Setting up realtime subscription for channels');
    
    const channel = supabase
      .channel(`channels:${serverId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'channels',
          filter: `server_id=eq.${serverId}`
        },
        (payload) => {
          console.log('[ServerView] Channel update received:', payload);
          queryClient.invalidateQueries({ queryKey: ['channels', serverId] });
          
          // Show toast notification for channel updates
          if (payload.eventType === 'INSERT') {
            toast.success('New channel created');
          } else if (payload.eventType === 'DELETE') {
            toast.info('Channel removed');
          }
        }
      )
      .subscribe((status) => {
        console.log('[ServerView] Channel subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('[ServerView] Successfully subscribed to channel updates');
        }
      });

    return () => {
      console.log('[ServerView] Cleaning up channel subscription');
      supabase.removeChannel(channel);
    };
  }, [serverId, queryClient]);

  // Error handler
  useEffect(() => {
    if (error) {
      console.error('[ServerView] Channel data error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to load channels");
    }
  }, [error]);

  return { 
    channels, 
    isLoading,
    error,
    isError: !!error
  };
};

