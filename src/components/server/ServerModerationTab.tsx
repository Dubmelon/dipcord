
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { ServerSettingsProps } from "./types";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const ServerModerationTab = ({ server }: ServerSettingsProps) => {
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
      <h2 className="text-2xl font-bold">Moderation Settings</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Explicit Content Filter</Label>
            <p className="text-sm text-muted-foreground">
              Filter explicit content in messages
            </p>
          </div>
          <Switch
            checked={server.explicit_content_filter}
            onCheckedChange={(checked) => handleSettingToggle('explicit_content_filter', checked)}
            disabled={!isOwner || updateServerSettings.isPending}
          />
        </div>
      </div>
    </div>
  );
};

