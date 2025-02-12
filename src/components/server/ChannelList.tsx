import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ChannelCategory } from "./channel/ChannelCategory";
import { UserControls } from "./channel/UserControls";
import { useCreateChannel, useCreateFolder } from "./channel/mutations";
import type { Channel } from "@/types/database";
import type { ChannelListProps, CategoryState, ChannelCategory as ChannelCategoryType } from "./channel/types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove
} from "@dnd-kit/sortable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FolderPlus, Hash, Volume2, Megaphone } from "lucide-react";

export const ChannelList = ({ serverId, channels, selectedChannel, onSelectChannel }: ChannelListProps) => {
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [newChannelType, setNewChannelType] = useState<Channel['type']>('text');
  const [newChannelCategory, setNewChannelCategory] = useState<ChannelCategoryType>("general");
  const [expandedCategories, setExpandedCategories] = useState<CategoryState>({ general: true });
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const createChannel = useCreateChannel(serverId, () => {
    queryClient.invalidateQueries({ queryKey: ['channels', serverId] });
    setIsCreatingChannel(false);
    setNewChannelName("");
    setNewChannelCategory("general");
  });

  const createFolder = useCreateFolder(serverId, currentUser?.id, () => {
    queryClient.invalidateQueries({ queryKey: ['server-folders', currentUser?.id] });
    setIsCreatingFolder(false);
    setNewFolderName("");
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

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast.error("Folder name is required");
      return;
    }

    createFolder.mutate({
      name: newFolderName.trim()
    });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id || !channels) {
      return;
    }

    const oldIndex = channels.findIndex(c => c.id === active.id);
    const newIndex = channels.findIndex(c => c.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) return;

    const activeChannel = channels[oldIndex];
    const overChannel = channels[newIndex];
    
    if (!activeChannel || !overChannel) return;

    try {
      // Calculate new positions for affected channels
      const updatedChannels = arrayMove(channels, oldIndex, newIndex);
      const updates = updatedChannels.map((channel, index) => ({
        id: channel.id,
        name: channel.name,
        type: channel.type,
        server_id: channel.server_id,
        position: index,
        category: channel.category,
        parent_id: channel.parent_id,
        description: channel.description
      }));

      // Update all affected channel positions in a single batch
      const { error } = await supabase
        .from('channels')
        .upsert(updates, { onConflict: 'id' });

      if (error) throw error;

      // Update local cache
      queryClient.invalidateQueries({ queryKey: ['channels', serverId] });
      toast.success("Channel position updated");
    } catch (error) {
      console.error('[ChannelList] Error updating channel position:', error);
      toast.error("Failed to update channel position");
    }
  };

  // Organize channels into a hierarchy and sort by position
  const organizeChannels = (channels: Channel[]) => {
    // Sort channels by position
    const sortedChannels = [...channels].sort((a, b) => {
      const posA = a.position ?? 0;
      const posB = b.position ?? 0;
      return posA - posB;
    });

    const rootChannels = sortedChannels.filter(c => !c.parent_id);
    const childChannels = sortedChannels.filter(c => c.parent_id);
    
    const channelMap = new Map<string, Channel[]>();
    
    rootChannels.forEach(channel => {
      const children = childChannels
        .filter(c => c.parent_id === channel.id)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      
      if (children.length > 0) {
        channelMap.set(channel.id, children);
      }
    });

    return { rootChannels, channelMap };
  };

  const { rootChannels, channelMap } = organizeChannels(channels || []);

  const channelsByCategory = rootChannels.reduce((acc, channel) => {
    const category = channel.category ?? 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(channel);
    return acc;
  }, {} as Record<ChannelCategoryType, Channel[]>);

  const getChannelTypeIcon = (type: Channel['type']) => {
    switch (type) {
      case 'text':
        return <Hash className="h-4 w-4" />;
      case 'voice':
        return <Volume2 className="h-4 w-4" />;
      case 'announcement':
        return <Megaphone className="h-4 w-4" />;
      default:
        return <Hash className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-muted/50 backdrop-blur-xl">
      <div className="p-2 flex gap-2">
        <Dialog open={isCreatingChannel} onOpenChange={setIsCreatingChannel}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Add Channel
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

        <Dialog open={isCreatingFolder} onOpenChange={setIsCreatingFolder}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1">
              <FolderPlus className="h-4 w-4 mr-2" />
              Add Folder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleCreateFolder} 
                disabled={createFolder.isPending || !newFolderName.trim()}
                className="w-full"
              >
                {createFolder.isPending ? "Creating..." : "Create Folder"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-y-auto flex-1">
        <div className="p-2 space-y-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={channels?.map(channel => channel.id) || []}
              strategy={verticalListSortingStrategy}
            >
              {Object.entries(channelsByCategory).map(([category, categoryChannels]) => (
                <ChannelCategory
                  key={category}
                  category={category}
                  channels={categoryChannels}
                  selectedChannel={selectedChannel}
                  onSelectChannel={onSelectChannel}
                  isExpanded={expandedCategories[category]}
                  onToggle={() => toggleCategory(category)}
                  childChannels={channelMap}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
      <UserControls serverId={serverId} currentUser={currentUser} />
    </div>
  );
};
