
export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  full_name: string | null;
  bio: string | null;
  is_online?: boolean;
  last_seen?: string;
}

export interface ProfileResponse {
  data: Profile | null;
  isLoading: boolean;
  error: Error | null;
}
