
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

const mockChannels: Record<string, Channel[]> = {
  "1": [
    {
      id: "1",
      name: "general",
      type: "text",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      server_id: "1",
      description: "General discussion"
    },
    {
      id: "2",
      name: "off-topic",
      type: "text",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      server_id: "1",
      description: "Random chatter"
    },
    {
      id: "3",
      name: "gaming-voice",
      type: "voice",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      server_id: "1",
      description: "Voice chat for gaming"
    }
  ],
  "2": [
    {
      id: "4",
      name: "book-discussions",
      type: "text",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      server_id: "2",
      description: "Discuss your current reads"
    },
    {
      id: "5",
      name: "reading-room",
      type: "voice",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      server_id: "2",
      description: "Voice chat for book discussions"
    }
  ]
};

export const useChannelData = (serverId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: channels, isLoading } = useQuery({
    queryKey: ['channels', serverId],
    queryFn: async () => {
      console.log(`[ServerView] Fetching channels for server: ${serverId}`);
      const startTime = performance.now();

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const serverChannels = mockChannels[serverId || ""];
      if (!serverChannels) {
        return [];
      }

      const endTime = performance.now();
      console.log(`[ServerView] Channels fetch completed in ${(endTime - startTime).toFixed(2)}ms. Found ${serverChannels.length} channels`);
      
      return serverChannels;
    },
    enabled: !!serverId,
    staleTime: 30000,
    meta: {
      errorMessage: "Failed to load channels"
    }
  });

  // Mock real-time updates setup
  const setupRealtimeSubscription = useCallback(() => {
    if (!serverId) return;

    console.log('[ServerView] Setting up mock realtime subscription for channels');
    
    return () => {
      console.log('[ServerView] Cleaning up mock realtime subscription');
    };
  }, [serverId]);

  useEffect(() => {
    const cleanup = setupRealtimeSubscription();
    return () => {
      if (cleanup) cleanup();
    };
  }, [setupRealtimeSubscription]);

  return { channels, isLoading };
};
