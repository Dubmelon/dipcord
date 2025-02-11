
export interface Server {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  banner_url: string | null;
  is_private: boolean;
  member_count: number;
  owner_id: string;
  created_at?: string;
  updated_at?: string;
  is_member?: boolean;
  currentUserId?: string;
  avatar_url?: string | null;
}
