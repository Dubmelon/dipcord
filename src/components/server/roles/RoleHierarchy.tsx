
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, GripVertical } from "lucide-react";
import type { Role } from "@/types/database";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";

interface RoleHierarchyProps {
  serverId: string;
  selectedRoleId: string | null;
  onSelectRole: (roleId: string) => void;
}

const SortableRole = ({ role, index, selectedRoleId, onSelect }: { 
  role: Role; 
  index: number;
  selectedRoleId: string | null;
  onSelect: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: role.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-sm transition-colors",
        selectedRoleId === role.id && "bg-accent"
      )}
    >
      <div {...listeners} className="cursor-grab">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      <button
        onClick={() => onSelect(role.id)}
        className="flex-1 flex items-center gap-2"
      >
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
      </button>
      <ChevronDown className="w-4 h-4 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">
        {index + 1}
      </span>
    </div>
  );
};

export const RoleHierarchy = ({ serverId, selectedRoleId, onSelectRole }: RoleHierarchyProps) => {
  const queryClient = useQueryClient();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const updatePositions = useMutation({
    mutationFn: async (updates: { id: string; position: number }[]) => {
      // Get existing roles first
      const { data: existingRoles } = await supabase
        .from('roles')
        .select('id, name, server_id')
        .in('id', updates.map(u => u.id));

      if (!existingRoles) throw new Error('Could not fetch existing roles');

      // Merge existing data with updates
      const mergedUpdates = updates.map(update => {
        const existingRole = existingRoles.find(r => r.id === update.id);
        if (!existingRole) throw new Error(`Role ${update.id} not found`);
        
        return {
          id: update.id,
          name: existingRole.name,
          server_id: existingRole.server_id,
          position: update.position,
          updated_at: new Date().toISOString()
        };
      });

      const { error } = await supabase
        .from('roles')
        .upsert(mergedUpdates);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server-roles', serverId] });
      toast.success('Role positions updated');
    },
    onError: (error) => {
      toast.error('Failed to update role positions');
      console.error('Error updating role positions:', error);
    }
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id || !roles) {
      return;
    }

    const oldIndex = roles.findIndex(role => role.id === active.id);
    const newIndex = roles.findIndex(role => role.id === over.id);
    
    const newRoles = [...roles];
    const [movedRole] = newRoles.splice(oldIndex, 1);
    newRoles.splice(newIndex, 0, movedRole);
    
    const updates = newRoles.map((role, index) => ({
      id: role.id,
      position: roles.length - index - 1
    }));

    updatePositions.mutate(updates);
  };

  if (!roles) return null;

  return (
    <ScrollArea className="h-[300px] border rounded-lg">
      <div className="p-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={roles.map(role => role.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {roles.map((role, index) => (
                <SortableRole
                  key={role.id}
                  role={role}
                  index={roles.length - index - 1}
                  selectedRoleId={selectedRoleId}
                  onSelect={onSelectRole}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </ScrollArea>
  );
};
