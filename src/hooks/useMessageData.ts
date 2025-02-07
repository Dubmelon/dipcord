
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  is_read?: boolean;
  is_delivered?: boolean;
}

export const useMessageData = (channelId: string | null) => {
  return useQuery({
    queryKey: ['messages', channelId],
    queryFn: async () => {
      if (!channelId) return [];
      
      console.log(`[ServerView] Fetching messages for channel: ${channelId}`);
      const startTime = performance.now();

      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:profiles(id, username, avatar_url, is_online)')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('[ServerView] Messages fetch error:', error);
        throw error;
      }

      const endTime = performance.now();
      console.log(`[ServerView] Messages fetch completed in ${(endTime - startTime).toFixed(2)}ms. Found ${data?.length} messages`);
      
      return data as Message[];
    },
    enabled: !!channelId,
    staleTime: 5000,
    meta: {
      errorMessage: "Failed to load messages"
    }
  });
};
