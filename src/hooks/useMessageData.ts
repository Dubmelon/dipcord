
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect } from "react";

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender: {
    id: string;
    username: string;
    avatar_url: string | null;
    is_online: boolean;
  } | null;
  media_urls: string[] | null;
  is_edited: boolean;
}

export const useMessageData = (channelId: string | null) => {
  const queryClient = useQueryClient();

  const { data: messages, isLoading, error } = useQuery({
    queryKey: ['messages', channelId],
    queryFn: async () => {
      if (!channelId) {
        throw new Error("Channel ID is required");
      }

      console.log(`[ServerView] Fetching messages for channel: ${channelId}`);
      const startTime = performance.now();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Authentication required");
      }

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
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('[ServerView] Message fetch error:', error);
        throw new Error(error.message);
      }

      const endTime = performance.now();
      console.log(`[ServerView] Messages fetch completed in ${(endTime - startTime).toFixed(2)}ms. Found ${data.length} messages`);
      
      return data as Message[];
    },
    enabled: !!channelId,
    staleTime: 5000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('Authentication')) {
        return false;
      }
      return failureCount < 3;
    },
    meta: {
      errorMessage: "Failed to load messages"
    }
  });

  // Set up realtime subscription for messages
  useEffect(() => {
    if (!channelId) return;

    console.log('[ServerView] Setting up realtime subscription for messages');
    
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
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', channelId] });
        }
      )
      .subscribe((status) => {
        console.log('[ServerView] Message subscription status:', status);
      });

    return () => {
      console.log('[ServerView] Cleaning up message subscription');
      supabase.removeChannel(channel);
    };
  }, [channelId, queryClient]);

  // Error handler
  useEffect(() => {
    if (error) {
      console.error('[ServerView] Message data error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to load messages");
    }
  }, [error]);

  return {
    messages,
    isLoading,
    error,
    isError: !!error
  };
};
