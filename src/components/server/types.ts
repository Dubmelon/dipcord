
import type { Server } from "@/types/database";

export interface ServerSettingsProps {
  server: Server;
}

export interface ServerImageUploadProps {
  server: Server;
  type: 'icon' | 'banner';
  currentUrl?: string | null;
  onUploadComplete: () => void;
  isOwner: boolean;
}

