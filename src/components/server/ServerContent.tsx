
import { Loader2, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageList } from "@/components/server/MessageList";
import { MessageInput } from "@/components/server/MessageInput";
import { VoiceChannel } from "@/components/voice/VoiceChannel";
import { useMessageData } from "@/hooks/useMessageData";
import type { Channel } from "@/types/database";

interface ServerContentProps {
  selectedChannel: string | null;
  selectedChannelType: Channel['type'] | undefined;
  isMobile: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  serverName?: string;
}

export const ServerContent = ({
  selectedChannel,
  selectedChannelType,
  isMobile,
  sidebarOpen,
  setSidebarOpen,
  serverName
}: ServerContentProps) => {
  const { messages, isLoading: loadingMessages } = useMessageData(selectedChannel);

  if (!selectedChannel) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center h-full text-muted-foreground"
      >
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-semibold">Welcome to {serverName}</h3>
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
    );
  }

  return (
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
      ) : selectedChannelType === 'forum' || selectedChannelType === 'announcement' ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>{selectedChannelType === 'forum' ? 'Forum' : 'Announcement'} channel functionality coming soon</p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-hidden">
            <MessageList 
              messages={messages || []} 
              isLoading={loadingMessages}
              emptyMessage="No messages in this channel yet"
            />
          </div>
          <div className="mt-auto">
            <MessageInput channelId={selectedChannel} />
          </div>
        </>
      )}
    </motion.div>
  );
};
