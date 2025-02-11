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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

const SortableRoleItem = ({ role, isSelected, onClick }: { 
  role: Role; 
  isSelected: boolean;
  onClick: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: role.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-accent ${
        isSelected ? 'bg-accent' : ''
      }`}
      onClick={onClick}
      {...attributes}
    >
      <div {...listeners} className="cursor-grab">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: role.color || '#99AAB5' }}
      />
      <span className="flex-1">{role.name}</span>
      {role.is_system && (
        <Shield className="w-4 h-4 text-blue-500" />
      )}
    </div>
  );
};

export const RolesManagementTab = ({ server }: RolesManagementTabProps) => {
  const queryClient = useQueryClient();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id || !roles) {
      return;
    }

    const oldIndex = roles.findIndex(role => role.id === active.id);
    const newIndex = roles.findIndex(role => role.id === over.id);
    
    const newRoles = arrayMove(roles, oldIndex, newIndex);
    const updates = newRoles.map((role, index) => ({
      id: role.id,
      position: newRoles.length - index - 1
    }));

    updateRolePositions.mutate(updates);
  };

  const predefinedColors = [
    '#99AAB5', '#1ABC9C', '#2ECC71', '#3498DB', '#9B59B6',
    '#E91E63', '#F1C40F', '#E67E22', '#E74C3C', '#95A5A6'
  ];

  const selectRoleColor = (color: string) => {
    if (selectedRole) {
      updateRole.mutate({ color });
    }
  };

  const handleIconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !selectedRole) return;
    
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${server.id}/role-icons/${selectedRole.id}.${fileExt}`;

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
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={roles?.map(role => role.id) ?? []}
                  strategy={verticalListSortingStrategy}
                >
                  {roles?.map((role) => (
                    <SortableRoleItem
                      key={role.id}
                      role={role}
                      isSelected={selectedRoleId === role.id}
                      onClick={() => setSelectedRoleId(role.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
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
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-2">
                  <label className="text-sm font-medium">Role Color</label>
                  <div className="flex flex-wrap gap-2 max-w-[200px]">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        className="w-6 h-6 rounded-full border border-border hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: color }}
                        onClick={() => selectRoleColor(color)}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <label className="text-sm font-medium">Role Icon</label>
                  <div className="flex items-center gap-2">
                    {selectedRole.icon && (
                      <img
                        src={selectedRole.icon}
                        alt="Role icon"
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('icon-upload')?.click()}
                    >
                      Upload Icon
                    </Button>
                    <input
                      id="icon-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleIconUpload}
                    />
                  </div>
                </div>
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
