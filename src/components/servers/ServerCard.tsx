
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Users } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Server } from "@/components/dashboard/types";
import { supabase } from "@/integrations/supabase/client";

interface ServerCardProps {
  server: Server;
  currentUserId: string;
}

export const ServerCard = ({ server, currentUserId }: ServerCardProps) => {
  const queryClient = useQueryClient();

  const joinServer = useMutation({
    mutationFn: async (serverId: string) => {
      const { error } = await supabase
        .from('server_members')
        .insert([
          { server_id: serverId, user_id: currentUserId }
        ]);
      
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      toast.success("Joined server successfully!");
    },
    onError: (error: Error) => {
      console.error('[ServerCard] Error joining server:', error);
      toast.error("Failed to join server");
    }
  });

  const isOwner = server.owner_id === currentUserId;

  return (
    <Card className="glass-morphism hover-scale">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={server.icon_url ?? undefined} />
            <AvatarFallback className="bg-white/10 text-white">
              {server.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg text-white">
              <Link to={`/servers/${server.id}`} className="hover:underline">
                {server.name}
              </Link>
            </CardTitle>
            <p className="text-sm text-white/60">{server.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-white/60">
          <Users className="h-4 w-4 mr-1" />
          {server.member_count} {server.member_count === 1 ? 'member' : 'members'}
        </div>
      </CardContent>
      <CardFooter>
        {server.is_member || isOwner ? (
          <Link to={`/servers/${server.id}`} className="w-full">
            <Button className="w-full" variant="outline">
              View Server
            </Button>
          </Link>
        ) : (
          <Button 
            className="w-full hover:bg-white/10" 
            variant="outline"
            onClick={() => joinServer.mutate(server.id)}
            disabled={joinServer.isPending}
          >
            {joinServer.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Joining...
              </>
            ) : (
              "Join Server"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
