
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  is_read?: boolean;
  is_delivered?: boolean;
}

interface MessageListProps {
  messages?: Message[];
  channelId: string;
}

const PAGE_SIZE = 50;

export const MessageList = ({ channelId }: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', channelId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: follows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const followedIds = follows?.map(f => f.following_id) || [];
      followedIds.push(user.id);

      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          media_urls,
          is_read,
          is_delivered,
          sender:profiles(id, username, avatar_url, is_online)
        `)
        .eq('channel_id', channelId)
        .in('sender_id', followedIds)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (error) throw error;
      return (data as Message[]).reverse();
    },
    staleTime: 30000, // Cache data for 30 seconds
  });

  useEffect(() => {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', channelId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, queryClient]);

  useEffect(() => {
    if (scrollRef.current && messages && isInitialLoad) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
        setIsInitialLoad(false);
      }
    }
  }, [messages, isInitialLoad]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 h-[calc(100vh-10rem)] overflow-hidden">
      <ScrollArea ref={scrollRef} className="h-full">
        <div className="space-y-2 p-4">
          {messages?.map((message) => (
            <MessageItem
              key={message.id}
              id={message.id}
              content={message.content}
              created_at={message.created_at}
              sender={message.sender}
              media_urls={message.media_urls}
              isRead={message.is_read}
              isDelivered={message.is_delivered}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
