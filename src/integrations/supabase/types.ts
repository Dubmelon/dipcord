export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action_type: string
          actor_id: string
          changes: Json | null
          created_at: string
          id: string
          metadata: Json | null
          server_id: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          action_type: string
          actor_id: string
          changes?: Json | null
          created_at?: string
          id?: string
          metadata?: Json | null
          server_id: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          action_type?: string
          actor_id?: string
          changes?: Json | null
          created_at?: string
          id?: string
          metadata?: Json | null
          server_id?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "server_stats"
            referencedColumns: ["server_id"]
          },
          {
            foreignKeyName: "audit_logs_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "user_server_list"
            referencedColumns: ["id"]
          },
        ]
      }
      automod_rules: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string
          created_by: string
          id: string
          is_enabled: boolean | null
          name: string
          rule_type: string
          server_id: string
          updated_at: string
        }
        Insert: {
          actions: Json
          conditions: Json
          created_at?: string
          created_by: string
          id?: string
          is_enabled?: boolean | null
          name: string
          rule_type: string
          server_id: string
          updated_at?: string
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string
          created_by?: string
          id?: string
          is_enabled?: boolean | null
          name?: string
          rule_type?: string
          server_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automod_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automod_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automod_rules_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "server_stats"
            referencedColumns: ["server_id"]
          },
          {
            foreignKeyName: "automod_rules_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automod_rules_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "user_server_list"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          created_at: string
          description: string | null
          icon_url: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      call_signaling: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          receiver_id: string
          sender_id: string
          signal: Json
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          receiver_id: string
          sender_id: string
          signal: Json
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
          signal?: Json
        }
        Relationships: [
          {
            foreignKeyName: "call_signaling_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_signaling_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_signaling_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_signaling_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_permission_overrides: {
        Row: {
          allow_permissions: Json | null
          channel_id: string | null
          created_at: string
          deny_permissions: Json | null
          id: string
          role_id: string | null
          updated_at: string
        }
        Insert: {
          allow_permissions?: Json | null
          channel_id?: string | null
          created_at?: string
          deny_permissions?: Json | null
          id?: string
          role_id?: string | null
          updated_at?: string
        }
        Update: {
          allow_permissions?: Json | null
          channel_id?: string | null
          created_at?: string
          deny_permissions?: Json | null
          id?: string
          role_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_permission_overrides_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_permission_overrides_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_permission_overrides_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "server_member_roles"
            referencedColumns: ["role_id"]
          },
        ]
      }
      channels: {
        Row: {
          category: Database["public"]["Enums"]["channel_category"] | null
          created_at: string
          description: string | null
          id: string
          name: string
          position: number | null
          server_id: string
          type: Database["public"]["Enums"]["channel_type"]
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["channel_category"] | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          position?: number | null
          server_id: string
          type: Database["public"]["Enums"]["channel_type"]
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["channel_category"] | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          position?: number | null
          server_id?: string
          type?: Database["public"]["Enums"]["channel_type"]
          updated_at?: string
        }
        Relationships: []
      }
      comment_reactions: {
        Row: {
          comment_id: string | null
          created_at: string
          id: string
          type: string
          user_id: string | null
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          id?: string
          type: string
          user_id?: string | null
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          id?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          dislikes_count: number | null
          id: string
          likes_count: number | null
          parent_comment_id: string | null
          post_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          dislikes_count?: number | null
          id?: string
          likes_count?: number | null
          parent_comment_id?: string | null
          post_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          dislikes_count?: number | null
          id?: string
          likes_count?: number | null
          parent_comment_id?: string | null
          post_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_messages: {
        Row: {
          content: string
          created_at: string
          embedded_media: Json[] | null
          id: string
          is_edited: boolean | null
          media_urls: string[] | null
          read_at: string | null
          receiver_id: string | null
          sender_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          embedded_media?: Json[] | null
          id?: string
          is_edited?: boolean | null
          media_urls?: string[] | null
          read_at?: string | null
          receiver_id?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          embedded_media?: Json[] | null
          id?: string
          is_edited?: boolean | null
          media_urls?: string[] | null
          read_at?: string | null
          receiver_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string | null
          following_id: string | null
          id: string
        }
        Insert: {
          created_at?: string
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string
          id: string
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          created_at: string
          deleted_at: string | null
          file_size: number
          filename: string
          id: string
          is_processed: boolean | null
          metadata: Json | null
          mime_type: string
          processing_error: string | null
          updated_at: string
          uploader_id: string
          url: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          file_size: number
          filename: string
          id?: string
          is_processed?: boolean | null
          metadata?: Json | null
          mime_type: string
          processing_error?: string | null
          updated_at?: string
          uploader_id: string
          url: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          file_size?: number
          filename?: string
          id?: string
          is_processed?: boolean | null
          metadata?: Json | null
          mime_type?: string
          processing_error?: string | null
          updated_at?: string
          uploader_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          channel_id: string
          content: string
          created_at: string
          edit_history: Json | null
          id: string
          is_edited: boolean | null
          media_urls: string[] | null
          search_vector: unknown | null
          sender_id: string
          updated_at: string
          version: number | null
        }
        Insert: {
          channel_id: string
          content: string
          created_at?: string
          edit_history?: Json | null
          id?: string
          is_edited?: boolean | null
          media_urls?: string[] | null
          search_vector?: unknown | null
          sender_id: string
          updated_at?: string
          version?: number | null
        }
        Update: {
          channel_id?: string
          content?: string
          created_at?: string
          edit_history?: Json | null
          id?: string
          is_edited?: boolean | null
          media_urls?: string[] | null
          search_vector?: unknown | null
          sender_id?: string
          updated_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          created_at: string
          id: string
          is_muted: boolean | null
          notification_level: string | null
          target_id: string
          target_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_muted?: boolean | null
          notification_level?: string | null
          target_id: string
          target_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_muted?: boolean | null
          notification_level?: string | null
          target_id?: string
          target_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          reference_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          reference_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          reference_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          channel_id: string | null
          comments_count: number | null
          content: string
          created_at: string
          embedded_media: Json[] | null
          engagement_count: number | null
          id: string
          is_edited: boolean | null
          likes_count: number | null
          media_urls: string[] | null
          post_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          channel_id?: string | null
          comments_count?: number | null
          content: string
          created_at?: string
          embedded_media?: Json[] | null
          engagement_count?: number | null
          id?: string
          is_edited?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          post_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          channel_id?: string | null
          comments_count?: number | null
          content?: string
          created_at?: string
          embedded_media?: Json[] | null
          engagement_count?: number | null
          id?: string
          is_edited?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          post_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          is_online: boolean | null
          last_seen: string | null
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_online?: boolean | null
          last_seen?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action_type: string
          created_at: string
          id: string
          request_count: number | null
          user_id: string
          window_start: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          request_count?: number | null
          user_id: string
          window_start?: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          request_count?: number | null
          user_id?: string
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "rate_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rate_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          target_id: string
          target_type: Database["public"]["Enums"]["content_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          target_id: string
          target_type: Database["public"]["Enums"]["content_type"]
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          target_id?: string
          target_type?: Database["public"]["Enums"]["content_type"]
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
        ]
      }
      role_icons: {
        Row: {
          created_at: string
          id: string
          role_id: string | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          role_id?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          role_id?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_icons_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_icons_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "server_member_roles"
            referencedColumns: ["role_id"]
          },
        ]
      }
      roles: {
        Row: {
          color: string | null
          created_at: string
          display_separately: boolean | null
          hoist: boolean | null
          icon: string | null
          id: string
          is_system: boolean | null
          mentionable: boolean | null
          name: string
          permissions: string[]
          permissions_v2: Json
          position: number
          read_message_history: boolean | null
          server_id: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          display_separately?: boolean | null
          hoist?: boolean | null
          icon?: string | null
          id?: string
          is_system?: boolean | null
          mentionable?: boolean | null
          name: string
          permissions?: string[]
          permissions_v2?: Json
          position?: number
          read_message_history?: boolean | null
          server_id: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          display_separately?: boolean | null
          hoist?: boolean | null
          icon?: string | null
          id?: string
          is_system?: boolean | null
          mentionable?: boolean | null
          name?: string
          permissions?: string[]
          permissions_v2?: Json
          position?: number
          read_message_history?: boolean | null
          server_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "server_stats"
            referencedColumns: ["server_id"]
          },
          {
            foreignKeyName: "roles_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roles_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "user_server_list"
            referencedColumns: ["id"]
          },
        ]
      }
      server_bans: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          moderator_id: string
          reason: string | null
          server_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          moderator_id: string
          reason?: string | null
          server_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          moderator_id?: string
          reason?: string | null
          server_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "server_bans_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_bans_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_bans_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "server_stats"
            referencedColumns: ["server_id"]
          },
          {
            foreignKeyName: "server_bans_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_bans_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "user_server_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_bans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_bans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
        ]
      }
      server_emoji: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          server_id: string
          updated_at: string
          url: string
          usage_count: number | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
          server_id: string
          updated_at?: string
          url: string
          usage_count?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          server_id?: string
          updated_at?: string
          url?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "server_emoji_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_emoji_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_emoji_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "server_stats"
            referencedColumns: ["server_id"]
          },
          {
            foreignKeyName: "server_emoji_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_emoji_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "user_server_list"
            referencedColumns: ["id"]
          },
        ]
      }
      server_folder_memberships: {
        Row: {
          created_at: string
          folder_id: string
          id: string
          position: number
          server_id: string
        }
        Insert: {
          created_at?: string
          folder_id: string
          id?: string
          position?: number
          server_id: string
        }
        Update: {
          created_at?: string
          folder_id?: string
          id?: string
          position?: number
          server_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "server_folder_memberships_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "server_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_folder_memberships_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "user_server_list"
            referencedColumns: ["folder_id"]
          },
          {
            foreignKeyName: "server_folder_memberships_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "server_stats"
            referencedColumns: ["server_id"]
          },
          {
            foreignKeyName: "server_folder_memberships_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_folder_memberships_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "user_server_list"
            referencedColumns: ["id"]
          },
        ]
      }
      server_folders: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_expanded: boolean | null
          is_muted: boolean | null
          name: string
          position: number
          server_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_expanded?: boolean | null
          is_muted?: boolean | null
          name: string
          position?: number
          server_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_expanded?: boolean | null
          is_muted?: boolean | null
          name?: string
          position?: number
          server_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "server_folders_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "server_stats"
            referencedColumns: ["server_id"]
          },
          {
            foreignKeyName: "server_folders_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_folders_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "user_server_list"
            referencedColumns: ["id"]
          },
        ]
      }
      server_invites: {
        Row: {
          code: string
          created_at: string
          creator_id: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          role_id: string | null
          server_id: string
          used_count: number | null
        }
        Insert: {
          code: string
          created_at?: string
          creator_id: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          role_id?: string | null
          server_id: string
          used_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          creator_id?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          role_id?: string | null
          server_id?: string
          used_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "server_invites_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_invites_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_invites_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_invites_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "server_member_roles"
            referencedColumns: ["role_id"]
          },
          {
            foreignKeyName: "server_invites_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "server_stats"
            referencedColumns: ["server_id"]
          },
          {
            foreignKeyName: "server_invites_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_invites_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "user_server_list"
            referencedColumns: ["id"]
          },
        ]
      }
      server_members: {
        Row: {
          id: string
          joined_at: string
          last_read_channels: Json | null
          nickname: string | null
          server_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          last_read_channels?: Json | null
          nickname?: string | null
          server_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          last_read_channels?: Json | null
          nickname?: string | null
          server_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "server_members_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "server_stats"
            referencedColumns: ["server_id"]
          },
          {
            foreignKeyName: "server_members_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_members_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "user_server_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
        ]
      }
      servers: {
        Row: {
          allow_invites: boolean | null
          banner_url: string | null
          community_updates_channel_id: string | null
          created_at: string
          default_channel_id: string | null
          default_notification_level: string | null
          description: string | null
          explicit_content_filter: boolean | null
          icon_url: string | null
          id: string
          is_community_enabled: boolean | null
          is_private: boolean | null
          member_count: number | null
          name: string
          owner_id: string
          region: Database["public"]["Enums"]["server_region"] | null
          require_approval: boolean | null
          rules_channel_id: string | null
          system_channel_id: string | null
          updated_at: string
          verification_level: number | null
          verification_requirements: Json | null
        }
        Insert: {
          allow_invites?: boolean | null
          banner_url?: string | null
          community_updates_channel_id?: string | null
          created_at?: string
          default_channel_id?: string | null
          default_notification_level?: string | null
          description?: string | null
          explicit_content_filter?: boolean | null
          icon_url?: string | null
          id?: string
          is_community_enabled?: boolean | null
          is_private?: boolean | null
          member_count?: number | null
          name: string
          owner_id: string
          region?: Database["public"]["Enums"]["server_region"] | null
          require_approval?: boolean | null
          rules_channel_id?: string | null
          system_channel_id?: string | null
          updated_at?: string
          verification_level?: number | null
          verification_requirements?: Json | null
        }
        Update: {
          allow_invites?: boolean | null
          banner_url?: string | null
          community_updates_channel_id?: string | null
          created_at?: string
          default_channel_id?: string | null
          default_notification_level?: string | null
          description?: string | null
          explicit_content_filter?: boolean | null
          icon_url?: string | null
          id?: string
          is_community_enabled?: boolean | null
          is_private?: boolean | null
          member_count?: number | null
          name?: string
          owner_id?: string
          region?: Database["public"]["Enums"]["server_region"] | null
          require_approval?: boolean | null
          rules_channel_id?: string | null
          system_channel_id?: string | null
          updated_at?: string
          verification_level?: number | null
          verification_requirements?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "servers_community_updates_channel_id_fkey"
            columns: ["community_updates_channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "servers_default_channel_id_fkey"
            columns: ["default_channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "servers_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "servers_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "servers_rules_channel_id_fkey"
            columns: ["rules_channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "servers_system_channel_id_fkey"
            columns: ["system_channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string
          device_info: Json | null
          expires_at: string
          id: string
          last_activity: string
          metadata: Json | null
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          expires_at: string
          id?: string
          last_activity?: string
          metadata?: Json | null
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          expires_at?: string
          id?: string
          last_activity?: string
          metadata?: Json | null
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
        ]
      }
      threads: {
        Row: {
          channel_id: string
          created_at: string
          creator_id: string
          id: string
          is_locked: boolean | null
          last_message_at: string
          title: string | null
          updated_at: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          creator_id: string
          id?: string
          is_locked?: boolean | null
          last_message_at?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          creator_id?: string
          id?: string
          is_locked?: boolean | null
          last_message_at?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "threads_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "threads_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "threads_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          awarded_at: string
          badge_id: string
          id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          badge_id: string
          id?: string
          user_id: string
        }
        Update: {
          awarded_at?: string
          badge_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
        ]
      }
      user_connections: {
        Row: {
          created_at: string
          id: string
          platform: string
          platform_id: string | null
          platform_username: string
          updated_at: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string
          id?: string
          platform: string
          platform_id?: string | null
          platform_username: string
          updated_at?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          platform_id?: string | null
          platform_username?: string
          updated_at?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "server_member_roles"
            referencedColumns: ["role_id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          enable_animations: boolean | null
          font_size: string | null
          id: string
          message_display: string | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enable_animations?: boolean | null
          font_size?: string | null
          id?: string
          message_display?: string | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enable_animations?: boolean | null
          font_size?: string | null
          id?: string
          message_display?: string | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
        ]
      }
      user_status: {
        Row: {
          created_at: string
          custom_status: string | null
          expires_at: string | null
          id: string
          status_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_status?: string | null
          expires_at?: string | null
          id?: string
          status_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_status?: string | null
          expires_at?: string | null
          id?: string
          status_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_channel_participants: {
        Row: {
          channel_id: string
          created_at: string
          id: string
          is_deafened: boolean | null
          is_muted: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          id?: string
          is_deafened?: boolean | null
          is_muted?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          id?: string
          is_deafened?: boolean | null
          is_muted?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_channel_participants_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_channel_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_channel_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
        ]
      }
      voip_sessions: {
        Row: {
          channel_id: string | null
          connection_state: string | null
          created_at: string | null
          id: string
          is_deafened: boolean | null
          is_muted: boolean | null
          last_heartbeat: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          channel_id?: string | null
          connection_state?: string | null
          created_at?: string | null
          id?: string
          is_deafened?: boolean | null
          is_muted?: boolean | null
          last_heartbeat?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          channel_id?: string | null
          connection_state?: string | null
          created_at?: string | null
          id?: string
          is_deafened?: boolean | null
          is_muted?: boolean | null
          last_heartbeat?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voip_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voip_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      server_member_roles: {
        Row: {
          joined_at: string | null
          nickname: string | null
          role_color: string | null
          role_icon: string | null
          role_id: string | null
          role_name: string | null
          role_position: number | null
          server_id: string | null
          server_member_id: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "server_members_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "server_stats"
            referencedColumns: ["server_id"]
          },
          {
            foreignKeyName: "server_members_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_members_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "user_server_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
        ]
      }
      server_stats: {
        Row: {
          channel_count: number | null
          last_message_at: string | null
          member_count: number | null
          message_count: number | null
          server_id: string | null
          server_name: string | null
        }
        Relationships: []
      }
      user_profiles_extended: {
        Row: {
          avatar_url: string | null
          badges: Json | null
          bio: string | null
          connections: Json | null
          created_at: string | null
          custom_status: string | null
          font_size: string | null
          full_name: string | null
          id: string | null
          is_online: boolean | null
          last_seen: string | null
          message_display: string | null
          status_type: string | null
          theme: string | null
          updated_at: string | null
          username: string | null
        }
        Relationships: []
      }
      user_server_list: {
        Row: {
          allow_invites: boolean | null
          banner_url: string | null
          community_updates_channel_id: string | null
          created_at: string | null
          default_channel_id: string | null
          default_notification_level: string | null
          description: string | null
          explicit_content_filter: boolean | null
          folder_color: string | null
          folder_id: string | null
          folder_name: string | null
          icon_url: string | null
          id: string | null
          is_community_enabled: boolean | null
          is_expanded: boolean | null
          is_muted: boolean | null
          is_private: boolean | null
          member_count: number | null
          name: string | null
          notification_level: string | null
          owner_id: string | null
          region: Database["public"]["Enums"]["server_region"] | null
          require_approval: boolean | null
          rules_channel_id: string | null
          server_position: number | null
          system_channel_id: string | null
          updated_at: string | null
          verification_level: number | null
          verification_requirements: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "servers_community_updates_channel_id_fkey"
            columns: ["community_updates_channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "servers_default_channel_id_fkey"
            columns: ["default_channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "servers_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "servers_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_extended"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "servers_rules_channel_id_fkey"
            columns: ["rules_channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "servers_system_channel_id_fkey"
            columns: ["system_channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_server_member_access: {
        Args: {
          server_id: string
          user_id: string
        }
        Returns: boolean
      }
      clean_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_invite_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      channel_category: "general" | "text" | "voice" | "announcement"
      channel_type: "text" | "voice" | "forum" | "announcement"
      content_type: "post" | "comment" | "message"
      notification_type:
        | "mention"
        | "reaction"
        | "follow"
        | "message"
        | "join"
        | "leave"
      server_region:
        | "us-west"
        | "us-east"
        | "eu-west"
        | "eu-central"
        | "asia"
        | "oceania"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
