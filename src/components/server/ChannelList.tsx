
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Hash, 
  Volume2, 
  MessageSquare, 
  Megaphone,
  ChevronRight,
  ChevronDown,
  Settings,
  Mic,
  Headphones,
  Settings2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { Channel } from "@/types/database";

interface ChannelListProps {
  serverId: string;
  channels: Channel[] | undefined;
  selectedChannel: string | null;
  onSelectChannel: (channelId: string) => void;
}

interface CategoryState {
  [key: string]: boolean;
}

export const ChannelList = ({ serverId, channels, selectedChannel, onSelectChannel }: ChannelListProps) => {
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelType, setNewChannelType] = useState<Channel['type']>('text');
  const [expandedCategories, setExpandedCategories] = useState<CategoryState>({ general: true });
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const createChannel = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('channels')
        .insert([
          {
            server_id: serverId,
            name: newChannelName,
            type: newChannelType,
          },
        ]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels', serverId] });
      setIsCreatingChannel(false);
      setNewChannelName("");
      toast.success("Channel created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create channel");
      console.error(error);
    },
  });

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

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  // Group channels by their category, defaulting to 'general' if not specified
  const channelsByCategory = channels?.reduce((acc, channel) => {
    // Using type assertion since we know the database has this column
    const category = (channel as any).category || 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(channel);
    return acc;
  }, {} as Record<string, Channel[]>) || {};

  return (
    <div className="w-60 h-full bg-muted/80 backdrop-blur-xl flex flex-col">
      {/* Server Header */}
      <div className="flex items-center justify-between p-4 border-b border-border cursor-pointer hover:bg-accent/50 transition-colors"
           onClick={() => navigate(`/servers/${serverId}/settings`)}>
        <h2 className="text-lg font-bold truncate">Server Settings</h2>
        <Settings2 className="h-4 w-4" />
      </div>

      {/* Channel List */}
      <ScrollArea className="flex-1">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="p-2"
        >
          {Object.entries(channelsByCategory).map(([category, categoryChannels]) => (
            <div key={category} className="mb-4">
              <button
                onClick={() => toggleCategory(category)}
                className="flex items-center gap-1 px-1 py-1 w-full hover:bg-accent/50 rounded-md transition-colors"
              >
                {expandedCategories[category] ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
                <span className="text-xs font-semibold uppercase">
                  {category}
                </span>
              </button>

              <AnimatePresence>
                {expandedCategories[category] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-2 space-y-1"
                  >
                    {categoryChannels.map((channel) => (
                      <motion.button
                        key={channel.id}
                        variants={item}
                        onClick={() => onSelectChannel(channel.id)}
                        className={`w-full p-2 flex items-center space-x-2 rounded-lg transition-all ${
                          selectedChannel === channel.id 
                            ? 'bg-accent text-accent-foreground' 
                            : 'hover:bg-accent/50'
                        }`}
                      >
                        {getChannelIcon(channel.type)}
                        <span className="truncate">{channel.name}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>
      </ScrollArea>

      {/* Create Channel Button */}
      <Dialog open={isCreatingChannel} onOpenChange={setIsCreatingChannel}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="mx-2 mb-2">
            <Plus className="h-4 w-4 mr-2" />
            Create Channel
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Channel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Channel name"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              {(['text', 'voice', 'forum', 'announcement'] as const).map((type) => (
                <Button
                  key={type}
                  variant={newChannelType === type ? 'default' : 'outline'}
                  onClick={() => setNewChannelType(type)}
                  className="flex items-center justify-center gap-2"
                >
                  {getChannelIcon(type)}
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
            <Button
              className="w-full"
              onClick={() => createChannel.mutate()}
              disabled={!newChannelName.trim()}
            >
              Create Channel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Controls Panel */}
      <div className="p-4 border-t border-border bg-background/50">
        <div className="flex items-center gap-3 mb-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentUser?.avatar_url || ''} />
            <AvatarFallback>{currentUser?.username?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{currentUser?.username}</p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={`${isMuted ? 'text-destructive' : ''}`}
            onClick={() => setIsMuted(!isMuted)}
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`${isDeafened ? 'text-destructive' : ''}`}
            onClick={() => setIsDeafened(!isDeafened)}
          >
            <Headphones className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
