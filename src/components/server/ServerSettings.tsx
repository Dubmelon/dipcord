
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Server } from "@/types/database";
import { Loader2, Upload } from "lucide-react";

interface ServerSettingsProps {
  server: Server;
}

export const ServerSettings = ({ server }: ServerSettingsProps) => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const isOwner = currentUser?.id === server.owner_id;
  const [uploading, setUploading] = useState(false);

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'icon' | 'banner') => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${server.id}/${type}-${Date.now()}.${fileExt}`;
      
      setUploading(true);
      
      const { error: uploadError } = await supabase
        .storage
        .from('server-assets')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase
        .storage
        .from('server-assets')
        .getPublicUrl(fileName);

      const updates = type === 'icon' 
        ? { icon_url: publicUrl }
        : { banner_url: publicUrl };

      updateServerSettings.mutate(updates);
      
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast.error(`Failed to upload ${type}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <Tabs defaultValue="overview" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
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
                  <div className="flex items-center gap-2">
                    {server.icon_url && (
                      <img 
                        src={server.icon_url} 
                        alt="Server icon" 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <Button 
                      variant="outline" 
                      disabled={!isOwner || uploading}
                      onClick={() => document.getElementById('icon-upload')?.click()}
                    >
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      Upload Icon
                    </Button>
                    <input
                      type="file"
                      id="icon-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'icon')}
                      disabled={!isOwner || uploading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Server Banner</Label>
                  <div className="flex items-center gap-2">
                    {server.banner_url && (
                      <img 
                        src={server.banner_url} 
                        alt="Server banner" 
                        className="w-20 h-12 rounded object-cover"
                      />
                    )}
                    <Button 
                      variant="outline" 
                      disabled={!isOwner || uploading}
                      onClick={() => document.getElementById('banner-upload')?.click()}
                    >
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      Upload Banner
                    </Button>
                    <input
                      type="file"
                      id="banner-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'banner')}
                      disabled={!isOwner || uploading}
                    />
                  </div>
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
      </Tabs>
    </div>
  );
};
