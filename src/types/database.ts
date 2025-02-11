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

export type ServerRegion = 'us-west' | 'us-east' | 'eu-west' | 'eu-central' | 'asia' | 'oceania';

export interface VerificationRequirements {
  minimum_account_age: number;
  require_email: boolean;
  [key: string]: any; // Add index signature for Json compatibility
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
  // Server settings
  default_channel_id: string | null;
  allow_invites: boolean;
  require_approval: boolean;
  explicit_content_filter: boolean;
  default_notification_level: string;
  verification_level: number;
  // New fields
  region: ServerRegion;
  system_channel_id: string | null;
  rules_channel_id: string | null;
  community_updates_channel_id: string | null;
  is_community_enabled: boolean;
  verification_requirements: VerificationRequirements;
  // Extended properties
  is_member?: boolean;
  owner?: Profile;
}

export interface ServerEmoji {
  id: string;
  server_id: string;
  name: string;
  url: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  usage_count: number;
}

export interface AuditLog {
  id: string;
  server_id: string;
  action_type: string;
  actor_id: string;
  target_id: string | null;
  target_type: string;
  changes: Record<string, any> | null;
  created_at: string;
  metadata: Record<string, any> | null;
  actor?: Profile;
}

export interface AutomodRule {
  id: string;
  server_id: string;
  name: string;
  is_enabled: boolean;
  rule_type: string;
  conditions: Record<string, any>;
  actions: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface Channel {
  id: string;
  server_id: string;
  name: string;
  description: string | null;
  type: 'text' | 'voice' | 'forum' | 'announcement';
  category: 'general' | 'text' | 'voice' | 'announcement' | null;
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
  // New fields
  version: number;
  edit_history: Array<{
    content: string;
    edited_at: string;
  }> | null;
  search_vector?: any; // tsvector type
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

// New interface for media assets
export interface MediaAsset {
  id: string;
  uploader_id: string;
  filename: string;
  file_size: number;
  mime_type: string;
  url: string;
  metadata: Record<string, any> | null;
  is_processed: boolean;
  processing_error: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// New interface for rate limits
export interface RateLimit {
  id: string;
  user_id: string;
  action_type: string;
  request_count: number;
  window_start: string;
  created_at: string;
}

export interface ServerMember {
  id: string;
  server_id: string;
  user_id: string;
  nickname: string | null;
  joined_at: string;
  user?: Profile;
  roles?: {
    role?: {
      id: string;
      name: string;
      color: string | null;
      position: number;
    };
  }[];
}

export interface Role {
  id: string;
  server_id: string;
  name: string;
  color: string | null;
  icon: string | null;
  position: number;
  permissions: string[];
  permissions_v2: {
    MANAGE_CHANNELS?: boolean;
    MANAGE_ROLES?: boolean;
    KICK_MEMBERS?: boolean;
    BAN_MEMBERS?: boolean;
    MANAGE_MESSAGES?: boolean;
    MANAGE_WEBHOOKS?: boolean;
    MANAGE_SERVER?: boolean;
    CREATE_INVITES?: boolean;
    SEND_MESSAGES?: boolean;
    EMBED_LINKS?: boolean;
    ATTACH_FILES?: boolean;
    MENTION_ROLES?: boolean;
    VIEW_CHANNELS?: boolean;
    ADMINISTRATOR?: boolean;
    VIEW_AUDIT_LOG?: boolean;
    MODERATE_MEMBERS?: boolean;
    MANAGE_THREADS?: boolean;
    CREATE_PUBLIC_THREADS?: boolean;
    CREATE_PRIVATE_THREADS?: boolean;
    ADD_REACTIONS?: boolean;
    USE_EXTERNAL_EMOJIS?: boolean;
    USE_EXTERNAL_STICKERS?: boolean;
    SEND_TTS_MESSAGES?: boolean;
    CONNECT?: boolean;
    SPEAK?: boolean;
    STREAM?: boolean;
    USE_VAD?: boolean;
    PRIORITY_SPEAKER?: boolean;
    MUTE_MEMBERS?: boolean;
    DEAFEN_MEMBERS?: boolean;
    MOVE_MEMBERS?: boolean;
    USE_SOUNDBOARD?: boolean;
    CREATE_EVENTS?: boolean;
    MANAGE_EVENTS?: boolean;
    MANAGE_EXPRESSIONS?: boolean;
    VIEW_GUILD_INSIGHTS?: boolean;
    READ_MESSAGE_HISTORY?: boolean;
  };
  is_system: boolean;
  hoist: boolean;
  mentionable: boolean;
  display_separately: boolean;
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

export interface ServerInvite {
  id: string;
  server_id: string;
  creator_id: string;
  code: string;
  max_uses?: number;
  used_count: number;
  expires_at?: string;
  created_at: string;
  role_id?: string;
  is_active: boolean;
  creator?: Profile;
}

export interface ServerBan {
  id: string;
  server_id: string;
  user_id: string;
  moderator_id: string;
  reason?: string;
  created_at: string;
  expires_at?: string;
  user?: Profile;
  moderator?: Profile;
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

export interface ServerEmojiQueryResult {
  data: ServerEmoji[] | null;
  isLoading: boolean;
  error: Error | null;
}

export interface AuditLogQueryResult {
  data: AuditLog[] | null;
  isLoading: boolean;
  error: Error | null;
}

export interface AutomodRuleQueryResult {
  data: AutomodRule[] | null;
  isLoading: boolean;
  error: Error | null;
}

export interface MediaAssetQueryResult {
  data: MediaAsset[] | null;
  isLoading: boolean;
  error: Error | null;
}

export interface ServerStatsQueryResult {
  data: {
    server_id: string;
    server_name: string;
    member_count: number;
    message_count: number;
    channel_count: number;
    last_message_at: string;
  } | null;
  isLoading: boolean;
  error: Error | null;
}
