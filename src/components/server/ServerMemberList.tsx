
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
import type { Role } from "@/types/database";

interface ServerMemberWithUser {
  server_member_id: string;
  user_id: string;
  nickname: string | null;
  role_id: string | null;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

interface ServerMemberListProps {
  serverId: string;
}

export const ServerMemberList = ({ serverId }: ServerMemberListProps) => {
  const queryClient = useQueryClient();

  const { data: members } = useQuery({
    queryKey: ['server-members', serverId],
    queryFn: async () => {
      const { data: serverMembers, error } = await supabase
        .from('server_members')
        .select(`
          id as server_member_id,
          user_id,
          nickname,
          role_id,
          user:user_id (
            id,
            username,
            avatar_url
          )
        `)
        .eq('server_id', serverId);

      if (error) throw error;
      return serverMembers as ServerMemberWithUser[];
    }
  });

  const { data: roles } = useQuery({
    queryKey: ['server-roles', serverId],
    queryFn: async () => {
      const { data: serverRoles, error } = await supabase
        .from('roles')
        .select('*')
        .eq('server_id', serverId);

      if (error) throw error;
      return serverRoles as Role[];
    }
  });

  const getMemberRole = (roleId: string | null) => {
    if (!roleId || !roles) return null;
    return roles.find(role => role.id === roleId);
  };

  const renderRoleTooltip = (role: Role) => (
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

  return (
    <div className="p-4 flex flex-col h-full">
      <h2 className="font-semibold text-lg mb-4">Members</h2>
      <ScrollArea className="flex-1">
        <div className="space-y-4">
          {members?.map((member) => {
            const role = getMemberRole(member.role_id);
            return (
              <motion.div
                key={member.server_member_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center gap-2"
              >
                <UserContextMenu userId={member.user_id}>
                  <button className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-accent transition-colors">
                    <Avatar>
                      <AvatarImage src={member.user?.avatar_url || undefined} />
                      <AvatarFallback>
                        <UserRound className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {member.nickname || member.user?.username}
                        </span>
                        {role && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: role.color || '#99AAB5' }}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                {renderRoleTooltip(role)}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  </button>
                </UserContextMenu>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
