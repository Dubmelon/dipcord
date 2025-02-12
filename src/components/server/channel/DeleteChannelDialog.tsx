
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Channel } from "@/types/database";

interface DeleteChannelDialogProps {
  channel: Channel;
  serverId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteChannelDialog = ({ channel, serverId, isOpen, onOpenChange }: DeleteChannelDialogProps) => {
  const queryClient = useQueryClient();

  const deleteChannel = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('channels')
        .delete()
        .eq('id', channel.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels', serverId] });
      onOpenChange(false);
      toast.success("Channel deleted successfully");
    },
    onError: (error) => {
      console.error('Error deleting channel:', error);
      toast.error("Failed to delete channel");
    }
  });

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Channel</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this channel? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteChannel.mutate()}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
