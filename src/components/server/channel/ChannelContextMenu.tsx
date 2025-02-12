
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  ContextMenu, 
  ContextMenuContent, 
  ContextMenuItem, 
  ContextMenuTrigger,
  ContextMenuSeparator
} from "@/components/ui/context-menu";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MoveVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Channel } from "@/types/database";

interface ChannelContextMenuProps {
  channel: Channel;
  children: React.ReactNode;
  serverId: string;
}

export const ChannelContextMenu = ({ channel, children, serverId }: ChannelContextMenuProps) => {
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newName, setNewName] = useState(channel.name);

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

  const handleEditChannel = async () => {
    if (!newName.trim() || newName === channel.name) {
      setIsEditDialogOpen(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('channels')
        .update({ name: newName.trim() })
        .eq('id', channel.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['channels', serverId] });
      toast.success("Channel renamed successfully");
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('[ChannelContextMenu] Error updating channel:', error);
      toast.error("Failed to rename channel");
    }
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger className="w-full">
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Rename Channel
          </ContextMenuItem>
          <ContextMenuItem>
            <MoveVertical className="h-4 w-4 mr-2" />
            Move Channel
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem 
            onClick={handleDeleteChannel}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Channel
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Channel</DialogTitle>
            <DialogDescription>
              Enter a new name for the channel
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Channel name"
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditChannel}
                disabled={!newName.trim() || newName === channel.name}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
