
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export const NotificationSettings = () => {
  const { currentUser } = useAuth();
  const { serverId } = useParams();
  const { settings, loadingSettings, updateNotificationSetting } = useNotificationSettings(currentUser?.id);
  
  // Server notification settings
  const [serverMuted, setServerMuted] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load initial settings
  useEffect(() => {
    if (settings && serverId) {
      const serverSetting = settings.find(
        s => s.target_type === 'server' && s.target_id === serverId
      );
      setServerMuted(serverSetting?.is_muted ?? false);
    }
  }, [settings, serverId]);

  const handleServerMuteChange = async (muted: boolean) => {
    if (!currentUser?.id || !serverId) return;
    
    setSaving(true);
    try {
      await updateNotificationSetting.mutateAsync({
        targetType: 'server',
        targetId: serverId,
        isMuted: muted
      });
      setServerMuted(muted);
    } finally {
      setSaving(false);
    }
  };

  if (loadingSettings) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Server Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications for all channels in this server
            </p>
          </div>
          <Switch
            checked={!serverMuted}
            onCheckedChange={(checked) => handleServerMuteChange(!checked)}
            disabled={saving}
          />
        </div>
        
        {/* We'll add more notification settings here in future iterations */}
      </CardContent>
    </Card>
  );
};
