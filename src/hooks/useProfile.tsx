
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types/profile";

export const useProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          avatar_url,
          banner_url,
          full_name,
          bio,
          about_markdown,
          accent_color,
          status_emoji,
          status_text,
          theme_preference,
          notification_preferences,
          settings,
          is_online,
          last_seen
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      return data as Profile;
    },
    enabled: !!userId,
  });
};

export const useProfileSettingsHistory = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ['profile-settings-history', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      
      const { data, error } = await supabase
        .from('profile_settings_history')
        .select(`
          id,
          profile_id,
          changed_by,
          changes,
          created_at
        `)
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data;
    },
    enabled: !!profileId,
  });
};

export const useProfiles = (userIds: string[] | undefined) => {
  return useQuery({
    queryKey: ['profiles', userIds],
    queryFn: async () => {
      if (!userIds?.length) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          avatar_url,
          banner_url,
          full_name,
          bio,
          about_markdown,
          accent_color,
          status_emoji,
          status_text,
          theme_preference,
          notification_preferences,
          settings,
          is_online,
          last_seen
        `)
        .in('id', userIds);

      if (error) throw error;
      
      return data as Profile[];
    },
    enabled: !!userIds?.length,
  });
};
