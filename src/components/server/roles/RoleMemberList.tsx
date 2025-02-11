
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import type { ServerMember, Role } from "@/types/database";

interface RoleMemberListProps {
  members: ServerMember[];
  role: Role;
  onAssignRole: (userId: string, roleId: string) => void;
  isDisabled?: boolean;
}

export const RoleMemberList = ({
  members,
  role,
  onAssignRole,
  isDisabled
}: RoleMemberListProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Members with this role</h3>
      <ScrollArea className="h-[200px] border rounded-lg p-4">
        {members?.map((member) => (
          <div 
            key={member.server_member_id}
            className="flex items-center justify-between py-2"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent" />
              <span>{member.user?.username || 'Unknown User'}</span>
            </div>
            <Switch
              checked={member.role_id === role.id}
              onCheckedChange={(checked) => {
                if (checked) {
                  onAssignRole(member.user_id, role.id);
                }
              }}
              disabled={isDisabled || role.is_system}
            />
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};
