
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
import type { Role } from "@/types/database";

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
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export const ServerMemberList = ({ serverId }: ServerMemberListProps) => {
  const { data: members } = useQuery({
    queryKey: ['server-members', serverId],
    queryFn: async () => {
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
          user:profiles!user_id(
            id,
            username,
            avatar_url
          )
        `)
        .eq('server_id', serverId)
        .order('role_position', { ascending: false })
        .order('nickname');

      if (error) throw error;
      return serverMembers as ServerMemberWithRole[];
    }
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
                              className="font-medium"
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
                                    <img 
                                      src={member.role_icon} 
                                      alt={`${member.role_name} icon`}
                                      className="w-4 h-4 rounded-full"
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="flex items-center gap-2">
                                      <img 
                                        src={member.role_icon} 
                                        alt={`${member.role_name} icon`}
                                        className="w-6 h-6 rounded-full"
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
