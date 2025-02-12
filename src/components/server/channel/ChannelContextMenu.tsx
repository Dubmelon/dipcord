
import { useState } from "react";
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger 
} from "@/components/ui/context-menu";
import { Pencil, Trash2 } from "lucide-react";
import { EditChannelDialog } from "./EditChannelDialog";
import { DeleteChannelDialog } from "./DeleteChannelDialog";
import type { Channel } from "@/types/database";

interface ChannelContextMenuProps {
  channel: Channel;
  serverId: string;
  children: React.ReactNode;
  isAdmin?: boolean;
}

export const ChannelContextMenu = ({ channel, serverId, children, isAdmin = false }: ChannelContextMenuProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!isAdmin) {
    return children;
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={() => setIsEditDialogOpen(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Channel
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem 
            onSelect={() => setIsDeleteDialogOpen(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Channel
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <EditChannelDialog 
        channel={channel}
        serverId={serverId}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      <DeleteChannelDialog
        channel={channel}
        serverId={serverId}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
};
