
export interface Message {
  id: string;
  channel_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  media_urls: string[] | null;
  sender?: {
    id: string;
    username: string;
    avatar_url: string | null;
    is_online: boolean;
  };
}

export interface MessageInput {
  channel_id: string;
  content: string;
  media_urls?: string[] | null;
}

export interface Channel {
  id: string;
  server_id: string;
  name: string;
  description: string | null;
  type: 'text' | 'voice' | 'forum' | 'announcement';
  position: number;
  created_at: string;
  updated_at: string;
}

export interface UnreadState {
  lastRead: string;
  mentionCount: number;
  hasUnread: boolean;
}
