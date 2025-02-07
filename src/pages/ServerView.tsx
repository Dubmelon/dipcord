
import { useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { ChannelList } from "@/components/server/ChannelList";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ServerContent } from "@/components/server/ServerContent";
import { useServerData } from "@/hooks/useServerData";
import { useChannelData } from "@/hooks/useChannelData";

const ServerView = () => {
  const { serverId } = useParams();
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = window.innerWidth <= 768;

  const { data: server, isLoading: loadingServer } = useServerData(serverId);
  const { channels, isLoading: loadingChannels } = useChannelData(serverId);

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

  const selectedChannelType = useMemo(() => 
    channels?.find(c => c.id === selectedChannel)?.type,
    [channels, selectedChannel]
  );

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
        <ServerContent
          selectedChannel={selectedChannel}
          selectedChannelType={selectedChannelType}
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          serverName={server?.name}
        />
      </motion.div>
    </div>
  );
};

export default ServerView;
