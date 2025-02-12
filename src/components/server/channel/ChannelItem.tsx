
import { Hash, Volume2, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Channel } from "@/types/database";
import { ChannelContextMenu } from "./ChannelContextMenu";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ChannelItemProps {
  channel: Channel;
  isSelected: boolean;
  onSelect: () => void;
  serverId: string;
  depth?: number;
}

export const ChannelItem = ({ channel, isSelected, onSelect, serverId, depth = 0 }: ChannelItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: channel.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginLeft: `${depth * 1}rem`
  };

  const getChannelIcon = (type: Channel['type']) => {
    switch (type) {
      case 'text':
        return <Hash className="h-4 w-4" />;
      case 'voice':
        return <Volume2 className="h-4 w-4" />;
      case 'announcement':
        return <Megaphone className="h-4 w-4" />;
      default:
        return <Hash className="h-4 w-4" />;
    }
  };

  return (
    <ChannelContextMenu channel={channel} serverId={serverId}>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={cn(
          "flex items-center p-2 rounded-md cursor-pointer",
          isSelected ? 'bg-accent' : 'hover:bg-accent/50'
        )}
        onClick={onSelect}
      >
        <div {...listeners} className="cursor-grab mr-2">
          {getChannelIcon(channel.type)}
        </div>
        <span className="ml-2 text-sm">{channel.name}</span>
      </div>
    </ChannelContextMenu>
  );
};
