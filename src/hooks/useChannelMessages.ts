
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/messaging";
import { toast } from "sonner";

export const useChannelMessages = (channelId: string | null) => {
  const queryClient = useQueryClient();

  const { data: messages, isLoading, error } = useQuery({
    queryKey: ['channel-messages', channelId],
    queryFn: async () => {
      if (!channelId) throw new Error("Channel ID is required");

      console.log(`[Messages] Fetching messages for channel: ${channelId}`);
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles(
            id,
            username,
            avatar_url,
            is_online
          )
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('[Messages] Error fetching messages:', error);
        throw error;
      }

      return data as Message[];
    },
    enabled: !!channelId
  });

  useEffect(() => {
    if (!channelId) return;

    console.log('[Messages] Setting up realtime subscription');
    
    const channel = supabase
      .channel(`messages:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`
        },
        (payload) => {
          console.log('[Messages] Message update received:', payload);
          queryClient.invalidateQueries({ queryKey: ['channel-messages', channelId] });
          
          if (payload.eventType === 'INSERT') {
            toast.success('New message received');
          }
        }
      )
      .subscribe((status) => {
        console.log('[Messages] Subscription status:', status);
      });

    return () => {
      console.log('[Messages] Cleaning up message subscription');
      supabase.removeChannel(channel);
    };
  }, [channelId, queryClient]);

  return {
    messages: messages?.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ),
    isLoading,
    error,
    isError: !!error
  };
};
