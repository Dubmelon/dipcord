
import type { Channel } from "@/types/database";

export interface ChannelListProps {
  serverId: string;
  channels: Channel[] | undefined;
  selectedChannel: string | null;
  onSelectChannel: (channelId: string) => void;
  isAdmin?: boolean;
}

export interface CategoryState {
  [key: string]: boolean;
}

export type ChannelCategory = string;

export interface CategoryProps {
  category: string;
  channels: Channel[];
  selectedChannel: string | null;
  onSelectChannel: (channelId: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
  childChannels: Map<string, Channel[]>;
  isAdmin?: boolean;
}

export interface UserControlsProps {
  currentUser: {
    id?: string;
    username?: string;
    avatar_url?: string;
  } | null;
}
