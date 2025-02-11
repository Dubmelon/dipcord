
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical, Settings, Shield } from "lucide-react";
import type { Server, Role } from "@/types/database";
import { toast } from "sonner";

interface RolesManagementTabProps {
  server: Server;
}

interface PermissionGroup {
  name: string;
  permissions: Array<{
    id: keyof Role["permissions_v2"];
    label: string;
    description: string;
  }>;
}

const permissionGroups: PermissionGroup[] = [
  {
    name: "General Permissions",
    permissions: [
      { id: "ADMINISTRATOR", label: "Administrator", description: "Full access to all settings and features" },
      { id: "VIEW_AUDIT_LOG", label: "View Audit Log", description: "View server audit logs" },
      { id: "MANAGE_SERVER", label: "Manage Server", description: "Edit server settings" },
      { id: "MANAGE_ROLES", label: "Manage Roles", description: "Create and edit roles" },
    ]
  },
  {
    name: "Membership Permissions",
    permissions: [
      { id: "KICK_MEMBERS", label: "Kick Members", description: "Remove members from the server" },
      { id: "BAN_MEMBERS", label: "Ban Members", description: "Ban members from the server" },
      { id: "MODERATE_MEMBERS", label: "Moderate Members", description: "Timeout members and manage nicknames" },
    ]
  },
  {
    name: "Channel Permissions",
    permissions: [
      { id: "MANAGE_CHANNELS", label: "Manage Channels", description: "Create and edit channels" },
      { id: "VIEW_CHANNELS", label: "View Channels", description: "View channels in the server" },
      { id: "MANAGE_WEBHOOKS", label: "Manage Webhooks", description: "Create and edit webhooks" },
    ]
  },
];

export const RolesManagementTab = ({ server }: RolesManagementTabProps) => {
  const queryClient = useQueryClient();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const { data: roles, isLoading } = useQuery({
    queryKey: ['server-roles', server.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('server_id', server.id)
        .order('position', { ascending: false });

      if (error) throw error;
      return data as Role[];
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

  const createRole = useMutation({
    mutationFn: async () => {
      const defaultPermissions: Role['permissions_v2'] = {
        SEND_MESSAGES: true,
        VIEW_CHANNELS: true,
        EMBED_LINKS: true,
        ATTACH_FILES: true,
        MANAGE_CHANNELS: false,
        MANAGE_ROLES: false,
        KICK_MEMBERS: false,
        BAN_MEMBERS: false,
        MANAGE_MESSAGES: false,
        MANAGE_WEBHOOKS: false,
        MANAGE_SERVER: false,
        CREATE_INVITES: true,
        MENTION_ROLES: true,
        CREATE_INSTANT_INVITE: true,
        CHANGE_NICKNAME: true,
        MANAGE_NICKNAMES: false,
        MANAGE_EMOJIS: false,
        ADMINISTRATOR: false,
        VIEW_AUDIT_LOG: false,
        VIEW_SERVER_INSIGHTS: false,
        MODERATE_MEMBERS: false
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

  if (isLoading) {
    return <div>Loading roles...</div>;
  }

  const selectedRole = roles?.find(role => role.id === selectedRoleId);

  const updateRolePermission = (permissionId: keyof Role["permissions_v2"], value: boolean) => {
    if (!selectedRole) return;

    const newPermissions = {
      ...selectedRole.permissions_v2,
      [permissionId]: value
    };
    updateRole.mutate({ permissions_v2: newPermissions });
  };

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
        <div className="col-span-4 border rounded-lg">
          <ScrollArea className="h-[600px]">
            <div className="p-4 space-y-2">
              {roles?.map((role) => (
                <div
                  key={role.id}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-accent ${
                    selectedRoleId === role.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedRoleId(role.id)}
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: role.color || '#99AAB5' }}
                  />
                  <span className="flex-1">{role.name}</span>
                  {role.is_system && (
                    <Shield className="w-4 h-4 text-blue-500" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {selectedRole && (
          <div className="col-span-8 border rounded-lg p-6 space-y-6">
            <div className="flex items-center justify-between">
              <Input
                value={selectedRole.name}
                onChange={(e) => updateRole.mutate({ name: e.target.value })}
                className="max-w-xs"
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteRole.mutate(selectedRole.id)}
                disabled={deleteRole.isPending || selectedRole.is_system}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Role
              </Button>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Display Role Separately</label>
                  <Switch
                    checked={selectedRole.display_separately}
                    onCheckedChange={(checked) => 
                      updateRole.mutate({ display_separately: checked })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Allow Mentions</label>
                  <Switch
                    checked={selectedRole.mentionable}
                    onCheckedChange={(checked) => 
                      updateRole.mutate({ mentionable: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-6">
              {permissionGroups.map((group) => (
                <div key={group.name} className="space-y-4">
                  <h3 className="font-semibold">{group.name}</h3>
                  <div className="space-y-2">
                    {group.permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium">{permission.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {permission.description}
                          </p>
                        </div>
                        <Switch
                          checked={selectedRole.permissions_v2[permission.id]}
                          onCheckedChange={(checked) => 
                            updateRolePermission(permission.id, checked)
                          }
                          disabled={selectedRole.is_system}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold">Members with this role</h3>
              <ScrollArea className="h-[200px] border rounded-lg p-4">
                {serverMembers?.map((member) => (
                  <div 
                    key={member.server_member_id}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-accent" />
                      <span>{member.user?.username || 'Unknown User'}</span>
                    </div>
                    <Switch
                      checked={member.role_id === selectedRole.id}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          assignRole.mutate({
                            userId: member.user_id,
                            roleId: selectedRole.id
                          });
                        }
                      }}
                      disabled={selectedRole.is_system}
                    />
                  </div>
                ))}
              </ScrollArea>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
