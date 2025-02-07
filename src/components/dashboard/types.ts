
export interface Server {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  is_private: boolean;
  member_count: number;
  owner_id: string | null;
  is_member?: boolean;
}
