

import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { MessageItem } from "./message/MessageItem";
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

  const scrollToBottom = (force = false) => {
    if (scrollRef.current && (shouldScrollToBottom || force)) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage.id !== lastMessageRef.current) {
        scrollToBottom(true);
        lastMessageRef.current = lastMessage.id;
      }
    }
  }, [messages]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldScrollToBottom(isNearBottom);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!messages.length) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 h-[calc(100vh-16rem)] overflow-hidden"> {/* Adjusted height to account for input */}
      <ScrollArea 
        ref={scrollRef} 
        className="h-full pb-20" /* Added bottom padding to prevent message overlap */
        onScrollCapture={handleScroll}
      >
        <div className="space-y-2 p-4">
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              id={message.id}
              content={message.content}
              created_at={message.created_at}
              sender={message.sender}
              media_urls={message.media_urls}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

