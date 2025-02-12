
export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  full_name: string | null;
  bio: string | null;
  is_online: boolean | null;
  last_seen: string | null;
  created_at: string;
  updated_at: string;
  is_admin: boolean | null;
  activity_status: {
    type: string | null;
    text: string | null;
    emoji: string | null;
  } | null;
  mutual_friends_count: number | null;
  mutual_servers_count: number | null;
  status_emoji: string | null;
  status_text: string | null;
  banner_url: string | null;
  about_markdown: string | null;
  accent_color: string | null;
  theme_preference: string | null;
  notification_preferences: {
    push: boolean;
    email: boolean;
  } | null;
  settings: {
    privacy: {
      showOnlineStatus: boolean;
      allowFriendRequests: boolean;
    };
    appearance: {
      theme: 'dark' | 'light';
      fontSize: 'small' | 'medium' | 'large';
      messageDisplay: 'cozy' | 'compact';
    };
    notifications: {
      sounds: boolean;
      desktop: boolean;
    };
  } | null;
}

export interface ProfileResponse {
  data: Profile | null;
  isLoading: boolean;
  error: Error | null;
}

export interface ProfileUpdate {
  username?: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  about_markdown?: string;
  accent_color?: string;
  status_emoji?: string;
  status_text?: string;
  theme_preference?: 'dark' | 'light';
  notification_preferences?: {
    push: boolean;
    email: boolean;
  };
  settings?: {
    privacy: {
      showOnlineStatus: boolean;
      allowFriendRequests: boolean;
    };
    appearance: {
      theme: 'dark' | 'light';
      fontSize: 'small' | 'medium' | 'large';
      messageDisplay: 'cozy' | 'compact';
    };
    notifications: {
      sounds: boolean;
      desktop: boolean;
    };
  };
}

export interface ProfileSettingsHistory {
  id: string;
  profile_id: string;
  changed_by: string;
  changes: {
    old_settings: Profile['settings'];
    new_settings: Profile['settings'];
  };
  created_at: string;
}
