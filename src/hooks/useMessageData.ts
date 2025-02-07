
import { useQuery } from "@tanstack/react-query";

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

const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "1",
      content: "Welcome to the Gaming Hub general chat!",
      created_at: new Date().toISOString(),
      sender: {
        id: "1",
        username: "JohnDoe",
        avatar_url: null,
        is_online: true
      },
      media_urls: null,
      is_read: true,
      is_delivered: true
    },
    {
      id: "2",
      content: "Hey everyone! What games are you playing?",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      sender: {
        id: "2",
        username: "GameMaster",
        avatar_url: null,
        is_online: false
      },
      media_urls: null,
      is_read: true,
      is_delivered: true
    }
  ],
  "2": [
    {
      id: "3",
      content: "Anyone up for some casual gaming?",
      created_at: new Date().toISOString(),
      sender: {
        id: "3",
        username: "CasualGamer",
        avatar_url: null,
        is_online: true
      },
      media_urls: null,
      is_read: false,
      is_delivered: true
    }
  ]
};

export const useMessageData = (channelId: string | null) => {
  return useQuery({
    queryKey: ['messages', channelId],
    queryFn: async () => {
      if (!channelId) return [];
      
      console.log(`[ServerView] Fetching messages for channel: ${channelId}`);
      const startTime = performance.now();

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const messages = mockMessages[channelId] || [];

      const endTime = performance.now();
      console.log(`[ServerView] Messages fetch completed in ${(endTime - startTime).toFixed(2)}ms. Found ${messages.length} messages`);
      
      return messages;
    },
    enabled: !!channelId,
    staleTime: 5000,
    meta: {
      errorMessage: "Failed to load messages"
    }
  });
};
