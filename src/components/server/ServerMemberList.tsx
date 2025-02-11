import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CircleDot, Shield, ShieldCheck, UserRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ServerMember } from "@/types/database";
import { UserContextMenu } from "../shared/UserContextMenu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ServerMemberListProps {
  serverId: string;
}

export const ServerMemberList = ({ serverId }: ServerMemberListProps) => {
  const queryClient = useQueryClient();

  const { data: members, isLoading } = useQuery({
    queryKey: ['server-members', serverId],
    queryFn: async () => {
      console.log('[ServerMemberList] Fetching members');
      const { data: serverMembers, error } = await supabase
        .from('server_member_roles')
        .select(`
          server_member_id,
          server_id,
          user_id,
          nickname,
          joined_at,
          role_id,
          role_name,
          role_color,
          role_position,
          role_icon,
          user:profiles!user_id(
            id,
            username,
            avatar_url,
            full_name,
            bio,
            is_online,
            last_seen
          )
        `)
        .eq('server_id', serverId)
        .order('role_position', { ascending: false })
        .order('joined_at', { ascending: true });

      if (error) throw error;

      const transformedMembers = serverMembers.map(member => ({
        id: member.server_member_id,
        server_id: member.server_id,
        user_id: member.user_id,
        nickname: member.nickname,
        joined_at: member.joined_at,
        user: member.user,
        roles: member.role_id ? [{
          role: {
            id: member.role_id,
            name: member.role_name,
            color: member.role_color,
            position: member.role_position,
            icon: member.role_icon
          }
        }] : []
      }));

      return transformedMembers as ServerMember[];
    },
    staleTime: 0,
    refetchOnMount: true
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

  const renderRoleTooltip = (role: ServerMember['roles'][0]['role']) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {role.icon && (
          <img 
            src={role.icon} 
            alt={`${role.name} icon`}
            className="w-6 h-6 rounded-full"
          />
        )}
        <span className="font-semibold" style={{ color: role.color || undefined }}>
          {role.name}
        </span>
      </div>
      <div className="text-xs text-muted-foreground">
        Position: {role.position}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">Loading members...</p>
      </div>
    );
  }

  const roleGroups = members?.reduce((acc, member) => {
    const role = member.roles?.[0]?.role;
    const key = role ? `role-${role.id}` : 'no-role';
    if (!acc[key]) {
      acc[key] = {
        role,
        members: [],
      };
    }
    acc[key].members.push(member);
    return acc;
  }, {} as Record<string, { role?: any, members: ServerMember[] }>);

  const sortedGroups = Object.entries(roleGroups || {}).sort((a, b) => {
    if (!a[1].role && b[1].role) return 1;
    if (a[1].role && !b[1].role) return -1;
    if (!a[1].role && !b[1].role) return 0;
    return (b[1].role.position || 0) - (a[1].role.position || 0);
  });

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        <AnimatePresence mode="popLayout">
          {sortedGroups.map(([key, group]) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-2"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h4 className="text-sm font-semibold mb-2 text-muted-foreground flex items-center gap-2 cursor-help">
                      {group.role ? (
                        <>
                          {group.role.position > 5 ? (
                            <ShieldCheck className="h-4 w-4" style={{ color: group.role.color || undefined }} />
                          ) : (
                            <Shield className="h-4 w-4" style={{ color: group.role.color || undefined }} />
                          )}
                          <span style={{ color: group.role.color || undefined }}>
                            {group.role.name}
                          </span>
                          {group.role.icon && (
                            <img 
                              src={group.role.icon} 
                              alt={`${group.role.name} icon`}
                              className="w-4 h-4 rounded-full"
                            />
                          )}
                        </>
                      ) : (
                        <>
                          <UserRound className="h-4 w-4" />
                          <span>Members</span>
                        </>
                      )}
                      <span className="text-xs ml-2">— {group.members.length}</span>
                    </h4>
                  </TooltipTrigger>
                  {group.role && (
                    <TooltipContent side="right">
                      {renderRoleTooltip(group.role)}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

              <div className="space-y-0.5">
                {group.members.map((member) => (
                  <UserContextMenu key={member.id} userId={member.user?.id}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 group cursor-pointer"
                    >
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.user?.avatar_url || ''} />
                          <AvatarFallback>
                            {member.user?.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {member.user?.is_online && (
                          <CircleDot className="h-3 w-3 text-green-500 absolute -bottom-0.5 -right-0.5" />
                        )}
                      </div>
                      <span 
                        className={`text-sm font-medium transition-colors group-hover:text-foreground`}
                        style={{ 
                          color: member.roles?.[0]?.role?.color || 
                            (member.user?.is_online ? 'var(--foreground)' : 'var(--muted-foreground)')
                        }}
                      >
                        {member.nickname || member.user?.username}
                      </span>
                    </motion.div>
                  </UserContextMenu>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
};
