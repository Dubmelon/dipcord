import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CircleDot } from "lucide-react";
import type { ServerMember } from "@/types/database";
import { UserContextMenu } from "../shared/UserContextMenu";

interface ServerMemberListProps {
  serverId: string;
}

export const ServerMemberList = ({ serverId }: ServerMemberListProps) => {
  const queryClient = useQueryClient();

  const { data: members, isLoading } = useQuery({
    queryKey: ['server-members', serverId],
    queryFn: async () => {
      console.log('[ServerMemberList] Fetching members');
      const { data, error } = await supabase
        .from('server_members')
        .select(`
          id,
          nickname,
          joined_at,
          user:profiles(
            id,
            username,
            avatar_url,
            is_online,
            last_seen
          )
        `)
        .eq('server_id', serverId)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      return data as ServerMember[];
    },
    staleTime: 0, // Force refresh on every mount
    refetchOnMount: true // Always refetch when component mounts
  });

  useEffect(() => {
    console.log('[ServerMemberList] Setting up realtime subscriptions');

    const membersChannel = supabase
      .channel(`server-members-${serverId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'server_members',
          filter: `server_id=eq.${serverId}`,
        },
        (payload) => {
          console.log('[ServerMemberList] Server member change:', payload);
          queryClient.invalidateQueries({ queryKey: ['server-members', serverId] });
        }
      )
      .subscribe();

    const presenceChannel = supabase
      .channel(`profiles-presence-${serverId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          console.log('[ServerMemberList] Profile presence change:', payload);
          queryClient.invalidateQueries({ queryKey: ['server-members', serverId] });
        }
      )
      .subscribe();

    return () => {
      console.log('[ServerMemberList] Cleaning up subscriptions');
      supabase.removeChannel(membersChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [serverId, queryClient]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">Loading members...</p>
      </div>
    );
  }

  const onlineMembers = members?.filter(member => member.user?.is_online) || [];
  const offlineMembers = members?.filter(member => !member.user?.is_online) || [];

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
            Online — {onlineMembers.length}
          </h4>
          <div className="space-y-2">
            {onlineMembers.map((member) => (
              <UserContextMenu key={member.id} userId={member.user?.id}>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.user?.avatar_url || ''} />
                      <AvatarFallback>
                        {member.user?.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <CircleDot className="h-3 w-3 text-green-500 absolute -bottom-0.5 -right-0.5" />
                  </div>
                  <span className="text-sm font-medium">
                    {member.nickname || member.user?.username}
                  </span>
                </div>
              </UserContextMenu>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
            Offline — {offlineMembers.length}
          </h4>
          <div className="space-y-2">
            {offlineMembers.map((member) => (
              <UserContextMenu key={member.id} userId={member.user?.id}>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.user?.avatar_url || ''} />
                    <AvatarFallback>
                      {member.user?.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-muted-foreground">
                    {member.nickname || member.user?.username}
                  </span>
                </div>
              </UserContextMenu>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};
