
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ServerImageUpload } from "./ServerImageUpload";
import type { ServerSettingsProps } from "./types";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const ServerOverviewTab = ({ server }: ServerSettingsProps) => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const isOwner = currentUser?.id === server.owner_id;

  const updateServerSettings = useMutation({
    mutationFn: async (updates: Partial<typeof server>) => {
      const { data, error } = await supabase
        .from('servers')
        .update(updates)
        .eq('id', server.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server', server.id] });
      toast.success("Server settings updated successfully");
    },
    onError: (error) => {
      console.error('Error updating server settings:', error);
      toast.error("Failed to update server settings");
    }
  });

  const handleSettingToggle = (setting: keyof typeof server, value: boolean) => {
    if (!isOwner) {
      toast.error("Only the server owner can modify settings");
      return;
    }
    
    updateServerSettings.mutate({
      [setting]: value
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Server Overview</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Server Name</Label>
          <Input 
            value={server.name}
            onChange={(e) => updateServerSettings.mutate({ name: e.target.value })}
            disabled={!isOwner || updateServerSettings.isPending}
          />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea 
            value={server.description || ''}
            onChange={(e) => updateServerSettings.mutate({ description: e.target.value })}
            disabled={!isOwner || updateServerSettings.isPending}
            placeholder="Describe your server..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Server Icon</Label>
            <ServerImageUpload
              server={server}
              type="icon"
              currentUrl={server.icon_url}
              onUploadComplete={() => queryClient.invalidateQueries({ queryKey: ['server', server.id] })}
              isOwner={isOwner}
            />
          </div>

          <div className="space-y-2">
            <Label>Server Banner</Label>
            <ServerImageUpload
              server={server}
              type="banner"
              currentUrl={server.banner_url}
              onUploadComplete={() => queryClient.invalidateQueries({ queryKey: ['server', server.id] })}
              isOwner={isOwner}
            />
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Invites</Label>
              <p className="text-sm text-muted-foreground">
                Allow members to create invite links
              </p>
            </div>
            <Switch
              checked={server.allow_invites}
              onCheckedChange={(checked) => handleSettingToggle('allow_invites', checked)}
              disabled={!isOwner || updateServerSettings.isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Approval</Label>
              <p className="text-sm text-muted-foreground">
                Require owner approval for new members
              </p>
            </div>
            <Switch
              checked={server.require_approval}
              onCheckedChange={(checked) => handleSettingToggle('require_approval', checked)}
              disabled={!isOwner || updateServerSettings.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

