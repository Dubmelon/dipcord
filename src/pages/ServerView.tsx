
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
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!server) {
    return <Navigate to="/servers" replace />;
  }

  return (
    <div className="flex h-full bg-background">
      <ServerNavigationSidebar />
      
      <div className="flex-1 flex flex-col min-h-screen max-h-screen overflow-hidden">
        <Routes>
          <Route path="settings/*" element={<ServerSettings server={server} />} />
          <Route path="user-settings/*" element={<ServerUserSettings />} />
          <Route path="" element={
            <div className="flex flex-1 h-full overflow-hidden">
              <AnimatePresence mode="wait">
                {sidebarOpen && (
                  <motion.div
                    initial={{ x: -300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed md:relative left-0 top-0 h-full z-30 md:w-52 w-52 border-r bg-muted/50 backdrop-blur-sm"
                  >
                    <ChannelList
                      serverId={serverId!}
                      channels={channels || []}
                      selectedChannel={selectedChannel}
                      onSelectChannel={handleChannelSelect}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                layout
                className="flex-1 flex flex-col h-full overflow-hidden"
                onClick={handleMessageAreaClick}
              >
                <ServerHeader 
                  server={server} 
                  isMobile={isMobile} 
                  onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
                />
                <ServerContent
                  selectedChannel={selectedChannel}
                  selectedChannelType={selectedChannelType}
                  isMobile={isMobile}
                  sidebarOpen={sidebarOpen}
                  setSidebarOpen={setSidebarOpen}
                  serverName={server.name}
                />
              </motion.div>

              <div className="hidden lg:block w-52 border-l bg-muted/50 backdrop-blur-sm overflow-y-auto">
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
