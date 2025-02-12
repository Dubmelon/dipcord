
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { supabase } from "@/integrations/supabase/client";
import type { Channel } from "@/types/database";

interface ChannelContextMenuProps {
  channel: Channel;
  children: React.ReactNode;
  serverId: string;
}

export const ChannelContextMenu = ({ channel, children, serverId }: ChannelContextMenuProps) => {
  const queryClient = useQueryClient();

  const handleDeleteChannel = async () => {
    try {
      const { error } = await supabase
        .from('channels')
        .delete()
        .eq('id', channel.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['channels', serverId] });
      toast.success("Channel deleted successfully");
    } catch (error) {
      console.error('[ChannelContextMenu] Error deleting channel:', error);
      toast.error("Failed to delete channel");
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger className="w-full">
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          className="text-destructive"
          onClick={handleDeleteChannel}
        >
          Delete Channel
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
