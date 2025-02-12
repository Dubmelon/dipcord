
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Hash, Volume2, Megaphone } from "lucide-react";
import { toast } from "sonner";
import type { Channel } from "@/types/database";
import type { ChannelCategory as ChannelCategoryType } from "./types";
import { useCreateChannel } from "./mutations";

interface CreateChannelDialogProps {
  serverId: string;
}

export const CreateChannelDialog = ({ serverId }: CreateChannelDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelType, setNewChannelType] = useState<Channel['type']>('text');
  const [newChannelCategory, setNewChannelCategory] = useState<ChannelCategoryType>("general");
  const queryClient = useQueryClient();

  const createChannel = useCreateChannel(serverId, () => {
    queryClient.invalidateQueries({ queryKey: ['channels', serverId] });
    setIsOpen(false);
    setNewChannelName("");
    setNewChannelCategory("general");
  });

  const handleCreateChannel = () => {
    if (!newChannelName.trim()) {
      toast.error("Channel name is required");
      return;
    }

    createChannel.mutate({
      name: newChannelName.trim(),
      type: newChannelType,
      category: newChannelCategory
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="w-8 h-8">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Channel name"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Select value={newChannelType} onValueChange={(value: Channel['type']) => setNewChannelType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Channel type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">
                  <div className="flex items-center">
                    <Hash className="h-4 w-4 mr-2" />
                    Text Channel
                  </div>
                </SelectItem>
                <SelectItem value="voice">
                  <div className="flex items-center">
                    <Volume2 className="h-4 w-4 mr-2" />
                    Voice Channel
                  </div>
                </SelectItem>
                <SelectItem value="announcement">
                  <div className="flex items-center">
                    <Megaphone className="h-4 w-4 mr-2" />
                    Announcement Channel
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Select value={newChannelCategory} onValueChange={(value: ChannelCategoryType) => setNewChannelCategory(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="voice">Voice</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleCreateChannel} 
            disabled={createChannel.isPending || !newChannelName.trim()}
            className="w-full"
          >
            {createChannel.isPending ? "Creating..." : "Create Channel"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
