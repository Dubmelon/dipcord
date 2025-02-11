
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { NotificationSetting } from '@/types/folders';

export const useNotificationSettings = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading: loadingSettings } = useQuery({
    queryKey: ['notification-settings', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data as NotificationSetting[];
    },
    enabled: !!userId
  });

  const updateNotificationSetting = useMutation({
    mutationFn: async ({
      targetType,
      targetId,
      isMuted
    }: {
      targetType: NotificationSetting['target_type'];
      targetId: string;
      isMuted: boolean;
    }) => {
      if (!userId) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('notification_settings')
        .upsert(
          {
            user_id: userId,
            target_type: targetType,
            target_id: targetId,
            is_muted: isMuted
          },
          {
            onConflict: 'user_id,target_type,target_id'
          }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      toast.success('Notification settings updated');
    },
    onError: (error) => {
      console.error('Error updating notification settings:', error);
      toast.error('Failed to update notification settings');
    }
  });

  return {
    settings,
    loadingSettings,
    updateNotificationSetting
  };
};
