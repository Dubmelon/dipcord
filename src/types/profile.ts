
import type { Profile as DatabaseProfile } from "./database";

export type Profile = DatabaseProfile;

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
}
