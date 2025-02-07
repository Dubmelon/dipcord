
import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChannelList } from "@/components/server/ChannelList";
import { MessageList } from "@/components/server/MessageList";
import { MessageInput } from "@/components/server/MessageInput";
import { VoiceChannel } from "@/components/voice/VoiceChannel";
import { Loader2, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
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

const ServerView = () => {
  const { serverId } = useParams();
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const queryClient = useQueryClient();
  const isMobile = window.innerWidth <= 768;

  // Memoized server query
  const { data: server, isLoading: loadingServer } = useQuery({
    queryKey: ['server', serverId],
    queryFn: async () => {
      console.log(`[ServerView] Fetching server details for ID: ${serverId}`);
      const startTime = performance.now();

      const { data, error } = await supabase
        .from('servers')
        .select('*, owner:profiles(username)')
        .eq('id', serverId)
        .single();
      
      if (error) {
        console.error('[ServerView] Server fetch error:', error);
        throw error;
      }

      const endTime = performance.now();
      console.log(`[ServerView] Server fetch completed in ${(endTime - startTime).toFixed(2)}ms:`, data);
      return data;
    },
    enabled: !!serverId,
    staleTime: 30000, // Cache for 30 seconds
    meta: {
      errorMessage: "Failed to load server details"
    }
  });

  // Memoized channels query
  const { data: channels, isLoading: loadingChannels } = useQuery({
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

  // Memoized messages query
  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', selectedChannel],
    queryFn: async () => {
      if (!selectedChannel) return [];
      
      console.log(`[ServerView] Fetching messages for channel: ${selectedChannel}`);
      const startTime = performance.now();

      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:profiles(id, username, avatar_url, is_online)')
        .eq('channel_id', selectedChannel)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('[ServerView] Messages fetch error:', error);
        throw error;
      }

      const endTime = performance.now();
      console.log(`[ServerView] Messages fetch completed in ${(endTime - startTime).toFixed(2)}ms. Found ${data?.length} messages`);
      
      return data as Message[];
    },
    enabled: !!selectedChannel,
    staleTime: 5000, // More frequent updates for messages
    meta: {
      errorMessage: "Failed to load messages"
    }
  });

  // Memoized realtime subscription setup
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

  // Memoized handlers
  const handleChannelSelect = useCallback((channelId: string) => {
    console.log(`[ServerView] Selecting channel: ${channelId}`);
    setSelectedChannel(channelId);
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const handleMessageAreaClick = useCallback(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Memoized values
  const selectedChannelType = useMemo(() => 
    channels?.find(c => c.id === selectedChannel)?.type,
    [channels, selectedChannel]
  );

  // Error handling for queries
  if (loadingServer || loadingChannels) {
    console.log('[ServerView] Loading server data...');
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background/80 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed md:relative left-0 top-0 h-[calc(100vh-4rem)] z-30 w-72"
          >
            <ChannelList
              serverId={serverId!}
              channels={channels}
              selectedChannel={selectedChannel}
              onSelectChannel={handleChannelSelect}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        layout
        className="flex-1 flex flex-col h-full relative"
        onClick={handleMessageAreaClick}
      >
        {!selectedChannel ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center h-full text-muted-foreground"
          >
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-semibold">Welcome to {server?.name}</h3>
              <p>Select a channel to start chatting</p>
              {isMobile && !sidebarOpen && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSidebarOpen(true);
                  }}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <Menu className="h-4 w-4" />
                  Open Channels
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <>
            {loadingMessages ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col h-full relative"
              >
                {isMobile && !sidebarOpen && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSidebarOpen(true);
                    }}
                    className="absolute top-2 left-2 z-20"
                    size="icon"
                    variant="outline"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                )}
                {selectedChannelType === 'voice' ? (
                  <VoiceChannel channelId={selectedChannel} />
                ) : (
                  <>
                    <div className="flex-1 overflow-hidden">
                      <MessageList messages={messages} channelId={selectedChannel} />
                    </div>
                    <div className="mt-auto">
                      <MessageInput channelId={selectedChannel} />
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ServerView;
