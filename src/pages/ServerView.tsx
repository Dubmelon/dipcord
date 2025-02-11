
import { useState, useMemo, useCallback } from "react";
import { useParams, Routes, Route, Navigate } from "react-router-dom";
import { ChannelList } from "@/components/server/ChannelList";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ServerContent } from "@/components/server/ServerContent";
import { ServerMemberList } from "@/components/server/ServerMemberList";
import { ServerHeader } from "@/components/server/ServerHeader";
import { ServerNavigationSidebar } from "@/components/server/ServerNavigationSidebar";
import { useServerData } from "@/hooks/useServerData";
import { useChannelData } from "@/hooks/useChannelData";
import { useIsMobile } from "@/hooks/use-mobile";
import { ServerSettings } from "@/components/server/ServerSettings";
import { ServerUserSettings } from "@/components/server/ServerUserSettings";

const ServerView = () => {
  const { serverId } = useParams();
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();

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
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!server) {
    return <Navigate to="/servers" replace />;
  }

  return (
    <div className="flex fixed inset-0">
      <ServerNavigationSidebar />
      
      <div className="flex flex-1">
        <Routes>
          <Route path="settings/*" element={<ServerSettings server={server} />} />
          <Route path="user-settings/*" element={<ServerUserSettings />} />
          <Route path="" element={
            <div className="flex flex-1">
              <AnimatePresence mode="wait">
                {sidebarOpen && (
                  <motion.div
                    initial={{ x: -300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="w-60 flex flex-col relative z-30"
                  >
                    <ServerHeader 
                      server={server} 
                      isMobile={isMobile} 
                      onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
                    />
                    <div className="flex-1 overflow-hidden">
                      <ChannelList
                        serverId={serverId!}
                        channels={channels || []}
                        selectedChannel={selectedChannel}
                        onSelectChannel={handleChannelSelect}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                layout
                className="flex-1 flex flex-col"
                onClick={handleMessageAreaClick}
              >
                <ServerContent
                  selectedChannel={selectedChannel}
                  selectedChannelType={selectedChannelType}
                  isMobile={isMobile}
                  sidebarOpen={sidebarOpen}
                  setSidebarOpen={setSidebarOpen}
                  serverName={server.name}
                />
              </motion.div>

              <div className="hidden lg:block w-60">
                <ServerMemberList serverId={serverId!} />
              </div>
            </div>
          } />
        </Routes>
      </div>
    </div>
  );
};

export default ServerView;
