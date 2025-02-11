
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { MessageItem } from "./message/MessageItem";
import { motion, AnimatePresence } from "framer-motion";
import { useVirtualizer } from "@tanstack/react-virtual";
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

interface MessageGroup {
  date: string;
  messages: Message[];
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
  const parentRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const lastMessageRef = useRef<string | null>(null);

  const messageGroups = useMemo(() => {
    console.log('[MessageList] Recalculating message groups');
    const groups = messages.reduce((acc, message) => {
      const date = new Date(message.created_at).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(message);
      return acc;
    }, {} as Record<string, Message[]>);

    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages
    }));
  }, [messages]);

  const virtualizer = useVirtualizer({
    count: messageGroups.length,
    getScrollElement: () => scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]') ?? null,
    estimateSize: useCallback(() => 100, []), // Estimate average height of a message group
    overscan: 5, // Number of items to render outside of the viewport
  });

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
      <div 
        ref={parentRef}
        className="py-4 space-y-4"
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const group = messageGroups[virtualRow.index];
          return (
            <motion.div
              key={group.date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-2 absolute w-full"
              style={{
                top: 0,
                transform: `translateY(${virtualRow.start}px)`,
                paddingBottom: '1rem',
              }}
            >
              <div className="sticky top-0 z-10 flex items-center justify-center">
                <span className="px-2 py-1 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm rounded">
                  {group.date}
                </span>
              </div>
              {group.messages.map((message) => (
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
          );
        })}
      </div>
    </ScrollArea>
  );
};
