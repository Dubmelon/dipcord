
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Channel } from "@/types/database";

interface EditChannelDialogProps {
  channel: Channel;
  serverId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditChannelDialog = ({ channel, serverId, isOpen, onOpenChange }: EditChannelDialogProps) => {
  const [newName, setNewName] = useState(channel.name);
  const [newCategory, setNewCategory] = useState<"general" | "text" | "voice" | "announcement">(
    channel.category as "general" | "text" | "voice" | "announcement" || "general"
  );
  const queryClient = useQueryClient();

  const updateChannel = useMutation({
    mutationFn: async (updates: Partial<Channel>) => {
      const { data, error } = await supabase
        .from('channels')
        .update(updates)
        .eq('id', channel.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels', serverId] });
      onOpenChange(false);
      toast.success("Channel updated successfully");
    },
    onError: (error) => {
      console.error('Error updating channel:', error);
      toast.error("Failed to update channel");
    }
  });

  const handleEdit = () => {
    if (!newName.trim() || !newCategory) {
      toast.error("Name and category are required");
      return;
    }

    updateChannel.mutate({
      name: newName.trim(),
      category: newCategory
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Channel</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="Channel name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <select
              className="w-full p-2 border rounded-md bg-background"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as typeof newCategory)}
            >
              <option value="general">General</option>
              <option value="text">Text</option>
              <option value="voice">Voice</option>
              <option value="announcement">Announcement</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEdit}
            disabled={updateChannel.isPending}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
