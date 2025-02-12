
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ServerFolder, ServerFolderMembership } from '@/types/folders';

export const useServerFolders = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: folders, isLoading: loadingFolders } = useQuery({
    queryKey: ['server-folders', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('server_folders')
        .select(`
          id,
          name,
          color,
          position,
          is_expanded,
          is_muted,
          created_at,
          updated_at,
          memberships:server_folder_memberships(
            id,
            server_id,
            position
          )
        `)
        .eq('user_id', userId)
        .order('position');

      if (error) throw error;
      return data as (ServerFolder & { memberships: ServerFolderMembership[] })[];
    },
    enabled: !!userId
  });

  const createFolder = useMutation({
    mutationFn: async ({ name, color }: { name: string; color?: string }) => {
      if (!userId) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('server_folders')
        .insert([
          {
            user_id: userId,
            name,
            color,
            position: folders?.length || 0
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server-folders'] });
    }
  });

  const updateFolder = useMutation({
    mutationFn: async (folder: Partial<ServerFolder> & { id: string }) => {
      const { data, error } = await supabase
        .from('server_folders')
        .update(folder)
        .eq('id', folder.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server-folders'] });
    }
  });

  const deleteFolder = useMutation({
    mutationFn: async (folderId: string) => {
      const { error } = await supabase
        .from('server_folders')
        .delete()
        .eq('id', folderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server-folders'] });
    }
  });

  const addServerToFolder = useMutation({
    mutationFn: async ({ folderId, serverId, position = 0 }: { folderId: string; serverId: string; position?: number }) => {
      // First remove from any existing folders
      await supabase
        .from('server_folder_memberships')
        .delete()
        .eq('server_id', serverId);

      const { data, error } = await supabase
        .from('server_folder_memberships')
        .insert([
          {
            folder_id: folderId,
            server_id: serverId,
            position
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server-folders'] });
    }
  });

  const removeServerFromFolder = useMutation({
    mutationFn: async (serverId: string) => {
      const { error } = await supabase
        .from('server_folder_memberships')
        .delete()
        .eq('server_id', serverId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server-folders'] });
    }
  });

  return {
    folders,
    loadingFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    addServerToFolder,
    removeServerFromFolder
  };
};
