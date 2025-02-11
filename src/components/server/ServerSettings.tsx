
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Server } from "@/types/database";

interface ServerSettingsProps {
  server: Server;
}

export const ServerSettings = ({ server }: ServerSettingsProps) => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const isOwner = currentUser?.id === server.owner_id;

  const updateServerSettings = useMutation({
    mutationFn: async (updates: Partial<Server>) => {
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

  const handleSettingToggle = (setting: keyof Server, value: boolean) => {
    if (!isOwner) {
      toast.error("Only the server owner can modify settings");
      return;
    }
    
    updateServerSettings.mutate({
      [setting]: value
    });
  };

  return (
    <div className="container max-w-2xl py-8">
      <Tabs defaultValue="overview" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Server Overview</h2>
            <div className="space-y-4">
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
        </TabsContent>

        <TabsContent value="moderation">
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
        </TabsContent>

        <TabsContent value="permissions">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Server Permissions</h2>
            <p className="text-muted-foreground">
              Configure roles and permissions for server members.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
