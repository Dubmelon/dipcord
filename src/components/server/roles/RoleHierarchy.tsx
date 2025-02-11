
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown } from "lucide-react";
import type { Role } from "@/types/database";
import { cn } from "@/lib/utils";

interface RoleHierarchyProps {
  serverId: string;
  selectedRoleId: string | null;
  onSelectRole: (roleId: string) => void;
}

export const RoleHierarchy = ({ serverId, selectedRoleId, onSelectRole }: RoleHierarchyProps) => {
  const { data: roles } = useQuery({
    queryKey: ['server-roles', serverId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('server_id', serverId)
        .order('position', { ascending: false });

      if (error) throw error;
      return data as Role[];
    }
  });

  return (
    <ScrollArea className="h-[300px] border rounded-lg">
      <div className="p-2 space-y-1">
        {roles?.map((role, index) => (
          <button
            key={role.id}
            onClick={() => onSelectRole(role.id)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-sm transition-colors",
              selectedRoleId === role.id && "bg-accent"
            )}
          >
            <div className="flex-1 flex items-center gap-2">
              {role.icon ? (
                <img src={role.icon} alt="" className="w-4 h-4 rounded-full" />
              ) : (
                <div 
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: role.color || '#99AAB5' }}
                />
              )}
              <span style={{ color: role.color }}>{role.name}</span>
              {role.is_system && (
                <span className="text-xs text-muted-foreground">(System)</span>
              )}
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {roles?.length - index}
            </span>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
};
