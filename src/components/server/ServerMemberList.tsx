
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UserContextMenu } from "../shared/UserContextMenu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface ServerMemberListProps {
  serverId: string;
}

interface ServerMemberWithRole {
  server_member_id: string;
  user_id: string;
  nickname: string | null;
  role_id: string | null;
  role_name: string | null;
  role_color: string | null;
  role_icon: string | null;
  role_position: number | null;
  permissions_v2: Record<string, boolean>;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export const ServerMemberList = ({ serverId }: ServerMemberListProps) => {
  const { data: members, isLoading } = useQuery({
    queryKey: ['server-members', serverId],
    queryFn: async () => {
      console.log('[ServerMemberList] Fetching members for server:', serverId);
      
      const { data: serverMembers, error } = await supabase
        .from('server_member_roles')
        .select(`
          server_member_id,
          user_id,
          nickname,
          role_id,
          role_name,
          role_color,
          role_icon,
          role_position,
          permissions_v2,
          user:profiles!user_id(
            id,
            username,
            avatar_url
          )
        `)
        .eq('server_id', serverId)
        .order('role_position', { ascending: false })
        .order('nickname');

      if (error) {
        console.error('[ServerMemberList] Error fetching members:', error);
        throw error;
      }

      console.log('[ServerMemberList] Fetched members:', serverMembers);
      return serverMembers as ServerMemberWithRole[];
    },
    staleTime: 1000 * 60, // 1 minute
  });

  // Group members by role
  const membersByRole = members?.reduce((acc, member) => {
    const roleName = member.role_name || 'Members';
    if (!acc[roleName]) {
      acc[roleName] = [];
    }
    acc[roleName].push(member);
    return acc;
  }, {} as Record<string, ServerMemberWithRole[]>);

  if (isLoading) {
    return (
      <div className="p-4">
        <h2 className="font-semibold text-lg mb-4">Members</h2>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent" />
              <div className="h-4 w-24 bg-accent rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const roleGroups = membersByRole ? Object.entries(membersByRole) : [];

  return (
    <div className="p-4 flex flex-col h-full">
      <h2 className="font-semibold text-lg mb-4">Members</h2>
      <ScrollArea className="flex-1">
        <div className="space-y-4">
          {roleGroups.map(([roleName, roleMembers]) => (
            <div key={roleName} className="space-y-1">
              <div className="text-xs font-semibold text-muted-foreground uppercase px-2">
                {roleName} — {roleMembers.length}
              </div>
              <AnimatePresence>
                {roleMembers.map((member) => (
                  <motion.div
                    key={member.server_member_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <UserContextMenu userId={member.user_id}>
                      <button className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-accent transition-colors">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.user?.avatar_url || undefined} />
                          <AvatarFallback>
                            <UserRound className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span 
                              className="font-medium truncate"
                              style={{ 
                                color: member.role_color || undefined 
                              }}
                            >
                              {member.nickname || member.user?.username}
                            </span>
                            {member.role_icon && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge 
                                      variant="outline"
                                      className="h-5 px-2 text-xs"
                                      style={{ 
                                        borderColor: member.role_color || undefined,
                                        color: member.role_color || undefined 
                                      }}
                                    >
                                      {member.role_name}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="flex items-center gap-2">
                                      <img 
                                        src={member.role_icon} 
                                        alt={`${member.role_name} icon`}
                                        className="w-4 h-4 rounded-full"
                                      />
                                      <span className="font-semibold" style={{ color: member.role_color || undefined }}>
                                        {member.role_name}
                                      </span>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          {member.nickname && (
                            <p className="text-xs text-muted-foreground truncate">
                              {member.user?.username}
                            </p>
                          )}
                        </div>
                      </button>
                    </UserContextMenu>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
