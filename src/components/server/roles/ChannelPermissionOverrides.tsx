
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, Hash, Volume2 } from "lucide-react";
import type { Channel, Role } from "@/types/database";
import { PERMISSIONS, PERMISSION_CATEGORIES } from "@/types/permissions";
import { cn } from "@/lib/utils";

interface ChannelPermissionOverridesProps {
  serverId: string;
  role: Role;
}

interface ChannelOverride {
  id: string;
  channel_id: string;
  role_id: string;
  allow_permissions: Record<string, boolean>;
  deny_permissions: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export const ChannelPermissionOverrides = ({ serverId, role }: ChannelPermissionOverridesProps) => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const queryClient = useQueryClient();

  const { data: channels } = useQuery({
    queryKey: ['channels', serverId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('server_id', serverId)
        .order('position');

      if (error) throw error;
      return data as Channel[];
    }
  });

  const { data: overrides } = useQuery({
    queryKey: ['channel-overrides', role.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('channel_permission_overrides')
        .select('*')
        .eq('role_id', role.id);

      if (error) throw error;
      return data as ChannelOverride[];
    }
  });

  const upsertOverride = useMutation({
    mutationFn: async ({ channelId, permissions }: { channelId: string, permissions: Record<string, boolean> }) => {
      const { error } = await supabase
        .from('channel_permission_overrides')
        .upsert({
          channel_id: channelId,
          role_id: role.id,
          allow_permissions: permissions,
          deny_permissions: {}
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channel-overrides', role.id] });
      toast.success('Channel permissions updated');
    },
    onError: (error) => {
      toast.error('Failed to update channel permissions');
      console.error('Error updating channel permissions:', error);
    }
  });

  const getChannelIcon = (type: Channel['type']) => {
    switch (type) {
      case 'voice':
        return <Volume2 className="w-4 h-4" />;
      default:
        return <Hash className="w-4 h-4" />;
    }
  };

  const getChannelOverrides = (channelId: string) => {
    const override = overrides?.find(o => o.channel_id === channelId);
    return override ? override.allow_permissions : {};
  };

  const handlePermissionToggle = (channelId: string, permissionId: string, value: boolean) => {
    const currentOverrides = getChannelOverrides(channelId);
    upsertOverride.mutate({
      channelId,
      permissions: {
        ...currentOverrides,
        [permissionId]: value
      }
    });
  };

  return (
    <div className="flex h-[600px] border rounded-lg">
      <div className="w-60 border-r">
        <ScrollArea className="h-full">
          <div className="p-2 space-y-1">
            {channels?.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-sm",
                  selectedChannel?.id === channel.id && "bg-accent"
                )}
              >
                {getChannelIcon(channel.type)}
                <span className="flex-1 text-left">{channel.name}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 p-4">
        {selectedChannel ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {getChannelIcon(selectedChannel.type)}
                {selectedChannel.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                Customize role permissions for this channel
              </p>
            </div>

            <div className="space-y-6">
              {Object.entries(PERMISSION_CATEGORIES).map(([category, label]) => {
                const categoryPermissions = PERMISSIONS.filter(p => p.category === category);
                if (categoryPermissions.length === 0) return null;

                const channelOverrides = getChannelOverrides(selectedChannel.id);

                return (
                  <div key={String(category)} className="space-y-4">
                    <h4 className="font-semibold">{label}</h4>
                    <div className="space-y-4">
                      {categoryPermissions.map((permission) => (
                        <div
                          key={String(permission.id)}
                          className="flex items-start justify-between space-x-4"
                        >
                          <div className="space-y-1">
                            <p className="font-medium">{permission.label}</p>
                            <p className="text-sm text-muted-foreground">
                              {permission.description}
                            </p>
                          </div>
                          <Switch
                            checked={channelOverrides[String(permission.id)] ?? role.permissions_v2[permission.id] ?? false}
                            onCheckedChange={(checked) => {
                              handlePermissionToggle(selectedChannel.id, String(permission.id), checked);
                            }}
                            disabled={role.is_system}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a channel to configure permissions
          </div>
        )}
      </div>
    </div>
  );
};
