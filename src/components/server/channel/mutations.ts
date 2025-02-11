
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Channel } from "@/types/database";

export const useCreateChannel = (serverId: string, onSuccess: () => void) => {
  return useMutation({
    mutationFn: async ({ name, type, category }: { 
      name: string; 
      type: Channel['type']; 
      category: string; 
    }) => {
      const { error } = await supabase
        .from('channels')
        .insert({
          server_id: serverId,
          name,
          type,
          category
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      onSuccess();
      toast.success("Channel created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create channel");
      console.error(error);
    },
  });
};

export const useCreateFolder = (serverId: string, userId: string | undefined, onSuccess: () => void) => {
  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const { error } = await supabase
        .from('server_folders')
        .insert({
          name,
          user_id: userId,
          server_id: serverId,
          is_expanded: true,
          position: 0
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      onSuccess();
      toast.success("Folder created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create folder");
      console.error(error);
    },
  });
};
