
export interface ServerFolder {
  id: string;
  user_id: string;
  server_id: string | null; // Added server_id field
  name: string;
  color?: string | null;
  position: number;
  is_expanded: boolean;
  is_muted: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServerFolderMembership {
  id: string;
  folder_id: string;
  server_id: string;
  position: number;
  created_at: string;
}

export interface NotificationSetting {
  id: string;
  user_id: string;
  target_type: 'server' | 'channel' | 'folder';
  target_id: string;
  is_muted: boolean;
  created_at: string;
  updated_at: string;
}
