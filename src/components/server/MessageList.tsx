
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { MessageItem } from "./message/MessageItem";
import { motion, AnimatePresence } from "framer-motion";
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

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
}

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export const MessageList = ({ 
  messages = [], 
  isLoading = false,
  emptyMessage = "No messages yet"
}: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const lastMessageRef = useRef<string | null>(null);

  const scrollToBottom = useCallback((force = false) => {
    if (scrollRef.current && (shouldScrollToBottom || force)) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [shouldScrollToBottom]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage.id !== lastMessageRef.current) {
        scrollToBottom(true);
        lastMessageRef.current = lastMessage.id;
      }
    }
  }, [messages, scrollToBottom]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldScrollToBottom(isNearBottom);
    }
  }, []);

  const messageGroups = useMemo(() => {
    console.log('[MessageList] Recalculating message groups');
    return messages.reduce((groups, message) => {
      const date = new Date(message.created_at).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    }, {} as Record<string, Message[]>);
  }, [messages]);

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-full"
      >
        <Loader2 className="h-8 w-8 animate-spin" />
      </motion.div>
    );
  }

  if (!messages.length) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center h-full text-muted-foreground"
      >
        <p>{emptyMessage}</p>
      </motion.div>
    );
  }

  return (
    <ScrollArea 
      ref={scrollRef} 
      className="h-full px-4"
      onScrollCapture={handleScroll}
    >
      <div className="py-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {Object.entries(messageGroups).map(([date, groupMessages]) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-2"
            >
              <div className="sticky top-0 z-10 flex items-center justify-center">
                <span className="px-2 py-1 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm rounded">
                  {date}
                </span>
              </div>
              {groupMessages.map((message) => (
                <MessageItem
                  key={message.id}
                  id={message.id}
                  content={message.content}
                  created_at={message.created_at}
                  sender={message.sender}
                  media_urls={message.media_urls}
                />
              ))}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
};
