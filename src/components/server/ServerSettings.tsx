
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import type { Server } from "@/types/database";

interface ServerSettingsProps {
  server: Server;
}

export const ServerSettings = ({ server }: ServerSettingsProps) => {
  const { currentUser } = useAuth();
  const { settings, updateNotificationSetting } = useNotificationSettings(currentUser?.id);

  const serverSettings = settings?.find(
    s => s.target_id === server.id && s.target_type === 'server'
  );

  const handleMuteToggle = async (checked: boolean) => {
    if (!currentUser) return;
    
    await updateNotificationSetting.mutateAsync({
      targetType: 'server',
      targetId: server.id,
      isMuted: checked
    });
  };

  return (
    <div className="container max-w-2xl py-8">
      <Tabs defaultValue="overview" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Server Overview</h2>
            <p className="text-muted-foreground">
              Configure your server settings and permissions.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Notification Settings</h2>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mute Server</Label>
                <p className="text-sm text-muted-foreground">
                  Disable notifications for this server
                </p>
              </div>
              <Switch
                checked={serverSettings?.is_muted || false}
                onCheckedChange={handleMuteToggle}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="permissions">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Server Permissions</h2>
            <p className="text-muted-foreground">
              Manage roles and permissions for server members.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
