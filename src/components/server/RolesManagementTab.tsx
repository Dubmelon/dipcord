import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Server, Role } from "@/types/database";
import { RoleListItem } from "./roles/RoleList";
import { RoleEditor } from "./roles/RoleEditor";
import { RoleMemberList } from "./roles/RoleMemberList";
import { RoleHierarchy } from "./roles/RoleHierarchy";

interface RolesManagementTabProps {
  server: Server;
}

const predefinedColors = [
  '#99AAB5', '#1ABC9C', '#2ECC71', '#3498DB', '#9B59B6',
  '#E91E63', '#F1C40F', '#E67E22', '#E74C3C', '#95A5A6'
];

export const RolesManagementTab = ({ server }: RolesManagementTabProps) => {
  const queryClient = useQueryClient();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: roles, isLoading } = useQuery({
    queryKey: ['server-roles', server.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('server_id', server.id)
        .order('position', { ascending: false });

      if (error) throw error;
      return data.map(role => ({
        ...role,
        permissions_v2: role.permissions_v2 as Role['permissions_v2']
      }));
    }
  });

  const { data: serverMembers } = useQuery({
    queryKey: ['server-members', server.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('server_member_roles')
        .select(`
          server_member_id,
          user_id,
          nickname,
          role_id,
          user:profiles!user_id(
            id,
            username,
            avatar_url
          )
        `)
        .eq('server_id', server.id);

      if (error) throw error;
      return data;
    }
  });

  const updateRolePositions = useMutation({
    mutationFn: async (updates: { id: string; position: number }[]) => {
      const { error } = await supabase
        .from('roles')
        .upsert(
          updates.map(({ id, position }) => ({
            id,
            position,
            server_id: server.id,
            updated_at: new Date().toISOString(),
            name: roles?.find(r => r.id === id)?.name || 'Unknown Role'
          }))
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server-roles', server.id] });
      toast.success('Role positions updated');
    },
    onError: (error) => {
      toast.error('Failed to update role positions');
      console.error('Error updating role positions:', error);
    }
  });

  const createRole = useMutation({
    mutationFn: async () => {
      const defaultPermissions: Role['permissions_v2'] = {
        SEND_MESSAGES: true,
        VIEW_CHANNELS: true,
        EMBED_LINKS: true,
        ATTACH_FILES: true,
        READ_MESSAGE_HISTORY: true,
        ADD_REACTIONS: true,
        USE_EXTERNAL_EMOJIS: true,
        CONNECT: true,
        SPEAK: true,
        USE_VAD: true,
        STREAM: true,
        CREATE_INVITES: true,
        CHANGE_NICKNAME: true,
      };

      const { data, error } = await supabase
        .from('roles')
        .insert({
          server_id: server.id,
          name: 'New Role',
          color: '#99AAB5',
          position: roles?.length || 0,
          permissions_v2: defaultPermissions
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server-roles', server.id] });
      toast.success('Role created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create role');
      console.error('Error creating role:', error);
    }
  });

  const updateRole = useMutation({
    mutationFn: async (updates: Partial<Role>) => {
      const { data, error } = await supabase
        .from('roles')
        .update(updates)
        .eq('id', selectedRoleId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server-roles', server.id] });
      toast.success('Role updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update role');
      console.error('Error updating role:', error);
    }
  });

  const deleteRole = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server-roles', server.id] });
      setSelectedRoleId(null);
      toast.success('Role deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete role');
      console.error('Error deleting role:', error);
    }
  });

  const assignRole = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role_id: roleId
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server-members', server.id] });
      toast.success('Role assigned successfully');
    },
    onError: (error) => {
      toast.error('Failed to assign role');
      console.error('Error assigning role:', error);
    }
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id || !roles) {
      return;
    }

    const oldIndex = roles.findIndex(role => role.id === active.id);
    const newIndex = roles.findIndex(role => role.id === over.id);
    
    const newRoles = [...roles];
    const [movedRole] = newRoles.splice(oldIndex, 1);
    newRoles.splice(newIndex, 0, movedRole);
    
    const updates = newRoles.map((role, index) => ({
      id: role.id,
      position: newRoles.length - index - 1
    }));

    updateRolePositions.mutate(updates);
  };

  const handleIconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !selectedRoleId) return;
    
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${server.id}/role-icons/${selectedRoleId}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('server-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('server-assets')
        .getPublicUrl(fileName);

      updateRole.mutate({ icon: publicUrl });
      toast.success('Role icon updated');
    } catch (error) {
      toast.error('Failed to upload role icon');
      console.error('Error uploading role icon:', error);
    }
  };

  if (isLoading) {
    return <div>Loading roles...</div>;
  }

  const selectedRole = roles?.find(role => role.id === selectedRoleId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Roles</h2>
        <Button
          onClick={() => createRole.mutate()}
          disabled={createRole.isPending}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Role
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4 space-y-4">
          <RoleHierarchy
            serverId={server.id}
            selectedRoleId={selectedRoleId}
            onSelectRole={setSelectedRoleId}
          />
          <p className="text-sm text-muted-foreground text-center">
            Drag roles to reorder them. Higher roles can manage lower roles.
          </p>
        </div>

        {selectedRole && (
          <div className="col-span-8 border rounded-lg p-6 space-y-6">
            <RoleEditor
              role={selectedRole}
              serverId={server.id}
              onUpdateRole={updateRole.mutate}
              onDeleteRole={() => deleteRole.mutate(selectedRole.id)}
              onIconUpload={handleIconUpload}
              predefinedColors={predefinedColors}
              isDeleting={deleteRole.isPending}
            />

            <Separator />

            <RoleMemberList
              members={serverMembers || []}
              role={selectedRole}
              onAssignRole={(userId, roleId) => assignRole.mutate({ userId, roleId })}
              isDisabled={assignRole.isPending}
            />
          </div>
        )}
      </div>
    </div>
  );
};
