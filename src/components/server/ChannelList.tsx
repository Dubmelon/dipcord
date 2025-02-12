
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ChannelCategory } from "./channel/ChannelCategory";
import { UserControls } from "./channel/UserControls";
import { CreateChannelDialog } from "./channel/CreateChannelDialog";
import { ChannelItem } from "./channel/ChannelItem";
import type { Channel } from "@/types/database";
import type { ChannelListProps, CategoryState } from "./channel/types";
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

export const ChannelList = ({ serverId, channels = [], selectedChannel, onSelectChannel }: ChannelListProps) => {
  const [expandedCategories, setExpandedCategories] = useState<CategoryState>({ general: true });
  const { currentUser } = useAuth();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

    try {
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

      const { error } = await supabase
        .from('channels')
        .upsert(updates);

      if (error) throw error;

      toast.success("Channel position updated");
    } catch (error) {
      console.error('[ChannelList] Error updating channel position:', error);
      toast.error("Failed to update channel position");
    }
  };

  // Organize channels into categories
  const channelsByCategory = channels.reduce((acc, channel) => {
    const category = channel.category ?? 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(channel);
    return acc;
  }, {} as Record<string, Channel[]>);

  // Create a map of parent channels to their children
  const channelMap = new Map<string, Channel[]>();
  const rootChannels = channels.filter(c => !c.parent_id);
  const childChannels = channels.filter(c => c.parent_id);
  
  rootChannels.forEach(channel => {
    const children = childChannels
      .filter(c => c.parent_id === channel.id)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    
    if (children.length > 0) {
      channelMap.set(channel.id, children);
    }
  });

  return (
    <div className="flex flex-col h-full bg-muted/50 backdrop-blur-xl">
      <div className="p-2">
        <CreateChannelDialog serverId={serverId} />
      </div>

      <div className="overflow-y-auto flex-1">
        <div className="p-2 space-y-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={channels.map(channel => channel.id)}
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
