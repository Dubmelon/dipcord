
import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { Message } from "@/types/messaging";
import { MessageItem } from "./MessageItem";
import { motion, AnimatePresence } from "framer-motion";

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
  const lastMessageRef = useRef<string | null>(null);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage.id !== lastMessageRef.current) {
        if (scrollRef.current) {
          const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
          if (scrollElement) {
            scrollElement.scrollTop = scrollElement.scrollHeight;
          }
        }
        lastMessageRef.current = lastMessage.id;
      }
    }
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
    >
      <div className="py-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
            />
          ))}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
};
