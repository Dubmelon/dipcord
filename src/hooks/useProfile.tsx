
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
          full_name,
          bio,
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
          full_name,
          bio,
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
