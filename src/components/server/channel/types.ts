
import type { Channel } from "@/types/database";

export interface ChannelListProps {
  serverId: string;
  channels: Channel[] | undefined;
  selectedChannel: string | null;
  onSelectChannel: (channelId: string) => void;
}

export interface CategoryState {
  [key: string]: boolean;
}

// Changed from enum to string type since categories are now user-defined
export type ChannelCategory = string;

export interface CategoryProps {
  category: string;
  channels: Channel[];
  selectedChannel: string | null;
  onSelectChannel: (channelId: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
  childChannels: Map<string, Channel[]>;
}

export interface UserControlsProps {
  serverId: string;
  currentUser: {
    id?: string;
    username?: string;
    avatar_url?: string;
  } | null;
}
