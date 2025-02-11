import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Settings2,
  FolderPlus
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { Channel } from "@/types/database";
import { Label } from "@/components/ui/label";

interface ChannelListProps {
  serverId: string;
  channels: Channel[] | undefined;
  selectedChannel: string | null;
  onSelectChannel: (channelId: string) => void;
}

interface CategoryState {
  [key: string]: boolean;
}

type ChannelCategory = 'general' | 'text' | 'voice' | 'announcement';

const CHANNEL_CATEGORIES: ChannelCategory[] = ['general', 'text', 'voice', 'announcement'];

export const ChannelList = ({ serverId, channels, selectedChannel, onSelectChannel }: ChannelListProps) => {
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [newChannelType, setNewChannelType] = useState<Channel['type']>('text');
  const [newChannelCategory, setNewChannelCategory] = useState<ChannelCategory>("general");
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
        .insert({
          server_id: serverId,
          name: newChannelName,
          type: newChannelType,
          category: newChannelCategory
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels', serverId] });
      setIsCreatingChannel(false);
      setNewChannelName("");
      setNewChannelCategory("general");
      toast.success("Channel created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create channel");
      console.error(error);
    },
  });

  const createFolder = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('server_folders')
        .insert({
          name: newFolderName,
          user_id: currentUser?.id,
          server_id: serverId,
          is_expanded: true,
          position: 0
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server-folders', currentUser?.id] });
      setIsCreatingFolder(false);
      setNewFolderName("");
      toast.success("Folder created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create folder");
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

  // Group channels by their category
  const channelsByCategory = (channels || []).reduce((acc, channel) => {
    const category = channel.category ?? 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(channel);
    return acc;
  }, {} as Record<ChannelCategory, Channel[]>);

  return (
    <div className="w-full h-full bg-muted/50 backdrop-blur-xl flex flex-col relative">
      <ScrollArea className="flex-1 pb-14">
        <div className="p-2 space-y-4">
          {Object.entries(channelsByCategory).map(([category, categoryChannels]) => (
            <div key={category} className="space-y-1">
              <button
                onClick={() => toggleCategory(category)}
                className="flex items-center gap-1 px-2 py-1.5 w-full hover:bg-accent/50 rounded-md transition-colors"
              >
                {expandedCategories[category] ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  {category}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {expandedCategories[category] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-2 space-y-0.5 overflow-hidden"
                  >
                    {categoryChannels.map((channel) => (
                      <motion.button
                        key={channel.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        onClick={() => onSelectChannel(channel.id)}
                        className={`w-full p-2 flex items-center space-x-2 rounded-lg transition-all ${
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
          ))}
        </div>
      </ScrollArea>

      {/* Create Channel/Folder Buttons */}
      <div className="p-2 space-y-2">
        <Dialog open={isCreatingChannel} onOpenChange={setIsCreatingChannel}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Plus className="h-4 w-4 mr-2" />
              Create Channel
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Channel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Channel Name</Label>
                <Input
                  placeholder="Channel name"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={newChannelCategory}
                  onValueChange={(value) => setNewChannelCategory(value as ChannelCategory)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHANNEL_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Channel Type</Label>
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

        <Dialog open={isCreatingFolder} onOpenChange={setIsCreatingFolder}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <FolderPlus className="h-4 w-4 mr-2" />
              Create Folder
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Folder Name</Label>
                <Input
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
              </div>
              
              <Button
                className="w-full"
                onClick={() => createFolder.mutate()}
                disabled={!newFolderName.trim()}
              >
                Create Folder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* User Controls - Fixed at bottom with Discord-like styling */}
      <div className="absolute bottom-0 left-0 right-0 h-13 px-2 py-2 border-t border-border bg-background/95 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentUser?.avatar_url || ''} />
            <AvatarFallback>{currentUser?.username?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{currentUser?.username}</p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
          <div className="flex gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${isMuted ? 'text-destructive' : ''}`}
              onClick={() => setIsMuted(!isMuted)}
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${isDeafened ? 'text-destructive' : ''}`}
              onClick={() => setIsDeafened(!isDeafened)}
            >
              <Headphones className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigate(`/settings/servers/${serverId}/user`)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
