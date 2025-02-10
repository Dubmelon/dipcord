
// Base types
export interface TurnServer {
  id: string;
  url: string;
  username?: string | null;
  credential?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Server {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  banner_url: string | null;
  is_private: boolean;
  member_count: number;
  owner_id: string;
  created_at: string;
  updated_at: string;
  // Extended properties
  is_member?: boolean;
  owner?: Profile;
}

export interface Channel {
  id: string;
  server_id: string;
  name: string;
  description: string | null;
  type: 'text' | 'voice' | 'forum' | 'announcement';
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  channel_id: string;
  sender_id: string;
  content: string;
  media_urls: string[] | null;
  is_edited: boolean | null;
  created_at: string;
  updated_at: string;
  sender?: Profile;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  full_name: string | null;
  bio: string | null;
  is_online: boolean;
  last_seen: string | null;
}

export interface ServerMember {
  id: string;
  server_id: string;
  user_id: string;
  nickname: string | null;
  joined_at: string;
  user?: Profile;
}

export interface Role {
  id: string;
  server_id: string;
  name: string;
  color: string | null;
  position: number;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface Thread {
  id: string;
  channel_id: string;
  creator_id: string;
  title: string | null;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  creator?: Profile;
}

// Hook return types
export interface ServerQueryResult {
  data: Server | null;
  isLoading: boolean;
  error: Error | null;
}

export interface ChannelQueryResult {
  data: Channel[] | null;
  isLoading: boolean;
  error: Error | null;
}

export interface MessageQueryResult {
  data: Message[] | null;
  isLoading: boolean;
  error: Error | null;
}
