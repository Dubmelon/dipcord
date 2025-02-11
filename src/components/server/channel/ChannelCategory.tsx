
import { motion, AnimatePresence } from "framer-motion";
import { Hash, Volume2, MessageSquare, Megaphone, ChevronRight, ChevronDown } from "lucide-react";
import type { Channel } from "@/types/database";
import type { CategoryProps } from "./types";

export const ChannelCategory = ({ 
  category, 
  channels, 
  selectedChannel, 
  onSelectChannel, 
  isExpanded, 
  onToggle 
}: CategoryProps) => {
  const getChannelIcon = (type: Channel['type']) => {
    switch (type) {
      case 'text':
        return <Hash className="h-4 w-4 shrink-0" />;
      case 'voice':
        return <Volume2 className="h-4 w-4 shrink-0" />;
      case 'forum':
        return <MessageSquare className="h-4 w-4 shrink-0" />;
      case 'announcement':
        return <Megaphone className="h-4 w-4 shrink-0" />;
    }
  };

  return (
    <div className="space-y-0.5">
      <button
        onClick={onToggle}
        className="flex items-center gap-1 px-2 py-1 w-full hover:bg-accent/50 rounded-md transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        <span className="text-xs font-semibold uppercase text-muted-foreground">
          {category}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-2 space-y-0.5 overflow-hidden"
          >
            {channels.map((channel) => (
              <motion.button
                key={channel.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                onClick={() => onSelectChannel(channel.id)}
                className={`w-full p-1.5 flex items-center space-x-2 rounded-lg transition-all ${
                  selectedChannel === channel.id 
                    ? 'bg-accent text-accent-foreground' 
                    : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                {getChannelIcon(channel.type)}
                <span className="truncate text-sm">{channel.name}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
