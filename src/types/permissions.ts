
import type { Role } from "./database";

export type PermissionCategory = 
  | 'general' 
  | 'membership' 
  | 'text' 
  | 'voice' 
  | 'events' 
  | 'advanced';

export interface Permission {
  id: keyof Role['permissions_v2'];
  label: string;
  description: string;
  category: PermissionCategory;
  recommendedForModerators?: boolean;
}

export const PERMISSIONS: Permission[] = [
  // General Permissions
  {
    id: 'ADMINISTRATOR',
    label: 'Administrator',
    description: 'Members with this permission have every permission and bypass channel specific permissions. This is a dangerous permission.',
    category: 'general',
  },
  {
    id: 'VIEW_AUDIT_LOG',
    label: 'View Audit Log',
    description: 'Members with this permission can view the server audit log.',
    category: 'general',
    recommendedForModerators: true,
  },
  {
    id: 'MANAGE_SERVER',
    label: 'Manage Server',
    description: 'Members with this permission can change the server name, region, icon, and other server settings.',
    category: 'general',
  },
  {
    id: 'MANAGE_ROLES',
    label: 'Manage Roles',
    description: 'Members with this permission can create new roles and edit/delete roles lower than their highest role.',
    category: 'general',
    recommendedForModerators: true,
  },
  
  // Membership Permissions
  {
    id: 'KICK_MEMBERS',
    label: 'Kick Members',
    description: 'Members with this permission can kick members from the server.',
    category: 'membership',
    recommendedForModerators: true,
  },
  {
    id: 'BAN_MEMBERS',
    label: 'Ban Members',
    description: 'Members with this permission can ban members from the server.',
    category: 'membership',
    recommendedForModerators: true,
  },
  {
    id: 'MODERATE_MEMBERS',
    label: 'Timeout Members',
    description: 'Members with this permission can timeout members and manage timeouts.',
    category: 'membership',
    recommendedForModerators: true,
  },
  
  // Text Channel Permissions
  {
    id: 'MANAGE_CHANNELS',
    label: 'Manage Channels',
    description: 'Members with this permission can create, edit, and delete channels.',
    category: 'text',
  },
  {
    id: 'MANAGE_MESSAGES',
    label: 'Manage Messages',
    description: 'Members with this permission can delete messages by other members and pin messages.',
    category: 'text',
    recommendedForModerators: true,
  },
  {
    id: 'MANAGE_THREADS',
    label: 'Manage Threads',
    description: 'Members with this permission can create, archive, and delete threads.',
    category: 'text',
  },
  {
    id: 'CREATE_PUBLIC_THREADS',
    label: 'Create Public Threads',
    description: 'Members with this permission can create threads that everyone can see.',
    category: 'text',
  },
  {
    id: 'CREATE_PRIVATE_THREADS',
    label: 'Create Private Threads',
    description: 'Members with this permission can create private threads.',
    category: 'text',
  },
  {
    id: 'SEND_MESSAGES',
    label: 'Send Messages',
    description: 'Members with this permission can send messages in text channels.',
    category: 'text',
  },
  {
    id: 'EMBED_LINKS',
    label: 'Embed Links',
    description: 'Members with this permission can embed links in their messages.',
    category: 'text',
  },
  {
    id: 'ATTACH_FILES',
    label: 'Attach Files',
    description: 'Members with this permission can upload files.',
    category: 'text',
  },
  {
    id: 'ADD_REACTIONS',
    label: 'Add Reactions',
    description: 'Members with this permission can add reactions to messages.',
    category: 'text',
  },
  {
    id: 'USE_EXTERNAL_EMOJIS',
    label: 'Use External Emojis',
    description: 'Members with this permission can use emojis from other servers.',
    category: 'text',
  },
  {
    id: 'USE_EXTERNAL_STICKERS',
    label: 'Use External Stickers',
    description: 'Members with this permission can use stickers from other servers.',
    category: 'text',
  },
  {
    id: 'MENTION_ROLES',
    label: 'Mention Roles',
    description: 'Members with this permission can mention roles.',
    category: 'text',
  },
  {
    id: 'SEND_TTS_MESSAGES',
    label: 'Send TTS Messages',
    description: 'Members with this permission can send text-to-speech messages.',
    category: 'text',
  },
  
  // Voice Permissions
  {
    id: 'CONNECT',
    label: 'Connect',
    description: 'Members with this permission can join voice channels.',
    category: 'voice',
  },
  {
    id: 'SPEAK',
    label: 'Speak',
    description: 'Members with this permission can speak in voice channels.',
    category: 'voice',
  },
  {
    id: 'STREAM',
    label: 'Video',
    description: 'Members with this permission can stream video in voice channels.',
    category: 'voice',
  },
  {
    id: 'USE_VAD',
    label: 'Use Voice Activity',
    description: 'Members must use Push-to-talk if this permission is disabled.',
    category: 'voice',
  },
  {
    id: 'PRIORITY_SPEAKER',
    label: 'Priority Speaker',
    description: 'Members with this permission have their voice volume increased when speaking.',
    category: 'voice',
  },
  {
    id: 'MUTE_MEMBERS',
    label: 'Mute Members',
    description: 'Members with this permission can mute members in voice channels.',
    category: 'voice',
    recommendedForModerators: true,
  },
  {
    id: 'DEAFEN_MEMBERS',
    label: 'Deafen Members',
    description: 'Members with this permission can deafen members in voice channels.',
    category: 'voice',
    recommendedForModerators: true,
  },
  {
    id: 'MOVE_MEMBERS',
    label: 'Move Members',
    description: 'Members with this permission can move other members between voice channels.',
    category: 'voice',
    recommendedForModerators: true,
  },
  {
    id: 'USE_SOUNDBOARD',
    label: 'Use Soundboard',
    description: 'Members with this permission can play sounds from the soundboard.',
    category: 'voice',
  },

  // Event Permissions
  {
    id: 'CREATE_EVENTS',
    label: 'Create Events',
    description: 'Members with this permission can create server events.',
    category: 'events',
  },
  {
    id: 'MANAGE_EVENTS',
    label: 'Manage Events',
    description: 'Members with this permission can edit and cancel server events.',
    category: 'events',
  },

  // Advanced Permissions
  {
    id: 'MANAGE_WEBHOOKS',
    label: 'Manage Webhooks',
    description: 'Members with this permission can create, edit, and delete webhooks.',
    category: 'advanced',
  },
  {
    id: 'MANAGE_EXPRESSIONS',
    label: 'Manage Expressions',
    description: 'Members with this permission can manage emojis and stickers.',
    category: 'advanced',
  },
  {
    id: 'VIEW_GUILD_INSIGHTS',
    label: 'View Server Insights',
    description: 'Members with this permission can view server insights.',
    category: 'advanced',
  },
];

export const PERMISSION_CATEGORIES: Record<PermissionCategory, string> = {
  general: 'General Permissions',
  membership: 'Member Management',
  text: 'Text Channel Permissions',
  voice: 'Voice Channel Permissions',
  events: 'Event Permissions',
  advanced: 'Advanced Permissions',
};
