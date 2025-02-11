
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Shield } from "lucide-react";
import type { Role } from "@/types/database";

interface RoleListItemProps {
  role: Role;
  isSelected: boolean;
  onClick: () => void;
}

export const RoleListItem = ({ role, isSelected, onClick }: RoleListItemProps) => {
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
      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-accent ${
        isSelected ? 'bg-accent' : ''
      }`}
      onClick={onClick}
      {...attributes}
    >
      <div {...listeners} className="cursor-grab">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: role.color || '#99AAB5' }}
      />
      <span className="flex-1">{role.name}</span>
      {role.is_system && (
        <Shield className="w-4 h-4 text-blue-500" />
      )}
    </div>
  );
};
