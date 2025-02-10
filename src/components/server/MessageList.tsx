
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const scrollToBottom = () => {
    if (scrollRef.current && messages.length > 0 && isInitialLoad) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
        setIsInitialLoad(false);
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    <div className="flex-1 h-[calc(100vh-10rem)] overflow-hidden">
      <ScrollArea ref={scrollRef} className="h-full">
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
