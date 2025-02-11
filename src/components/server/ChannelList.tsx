import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ChannelCategory } from "./channel/ChannelCategory";
import { UserControls } from "./channel/UserControls";
import { useCreateChannel, useCreateFolder } from "./channel/mutations";
import type { Channel } from "@/types/database";
import type { ChannelListProps, CategoryState, ChannelCategory as ChannelCategoryType } from "./channel/types";

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

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const channelsByCategory = (channels || []).reduce((acc, channel) => {
    const category = channel.category ?? 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(channel);
    return acc;
  }, {} as Record<ChannelCategoryType, Channel[]>);

  return (
    <div className="flex flex-col h-full bg-muted/50 backdrop-blur-xl">
      <div className="overflow-y-auto flex-1">
        <div className="p-2 space-y-2">
          {Object.entries(channelsByCategory).map(([category, categoryChannels]) => (
            <ChannelCategory
              key={category}
              category={category}
              channels={categoryChannels}
              selectedChannel={selectedChannel}
              onSelectChannel={onSelectChannel}
              isExpanded={expandedCategories[category]}
              onToggle={() => toggleCategory(category)}
            />
          ))}
        </div>
      </div>
      <UserControls serverId={serverId} currentUser={currentUser} />
    </div>
  );
};
