
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { MessageInput } from "@/types/messaging";
import { toast } from "sonner";

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: MessageInput) => {
      const { error } = await supabase
        .from('messages')
        .insert([message]);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['channel-messages', variables.channel_id] 
      });
    },
    onError: (error) => {
      console.error('[SendMessage] Error sending message:', error);
      toast.error("Failed to send message");
    }
  });
};
