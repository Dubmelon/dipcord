
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const ServerUserSettings = () => {
  const { serverId } = useParams();
  const { currentUser } = useAuth();

  // Fetch server member data
  const { data: memberData } = useQuery({
    queryKey: ['server-member', serverId, currentUser?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('server_members')
        .select('*')
        .eq('server_id', serverId)
        .eq('user_id', currentUser?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!serverId && !!currentUser,
  });

  // Update nickname mutation
  const updateNickname = useMutation({
    mutationFn: async (nickname: string) => {
      const { error } = await supabase
        .from('server_members')
        .update({ nickname })
        .eq('server_id', serverId)
        .eq('user_id', currentUser?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Nickname updated successfully");
    },
    onError: () => {
      toast.error("Failed to update nickname");
    },
  });

  return (
    <div className="container max-w-2xl py-8">
      <Tabs defaultValue="display" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="display">
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>
                Customize how you appear in this server
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nickname">Server Nickname</Label>
                <Input
                  id="nickname"
                  placeholder="Enter a nickname"
                  defaultValue={memberData?.nickname || ""}
                  onChange={(e) => updateNickname.mutate(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how you receive notifications from this server
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="mute-server">Mute Server</Label>
                <Switch id="mute-server" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="suppress-everyone">Suppress @everyone</Label>
                <Switch id="suppress-everyone" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="mobile-push">Mobile Push Notifications</Label>
                <Switch id="mobile-push" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
