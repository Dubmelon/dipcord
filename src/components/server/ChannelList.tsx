
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, Hash, Volume2, MessageSquare, Megaphone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import type { Channel } from "@/types/database";

interface ChannelListProps {
  serverId: string;
  channels: Channel[] | undefined;
  selectedChannel: string | null;
  onSelectChannel: (channelId: string) => void;
}

export const ChannelList = ({ serverId, channels, selectedChannel, onSelectChannel }: ChannelListProps) => {
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelType, setNewChannelType] = useState<Channel['type']>('text');
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

  return (
    <div className="w-72 h-full bg-muted/80 backdrop-blur-xl border-r border-border">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-bold">Channels</h2>
        <Dialog open={isCreatingChannel} onOpenChange={setIsCreatingChannel}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-accent">
              <Plus className="h-4 w-4" />
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
      </div>
      <ScrollArea className="h-[calc(100vh-5rem)] px-2">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4 py-4"
        >
          {(['text', 'announcement', 'forum', 'voice'] as const).map((channelType) => {
            const typeChannels = channels?.filter((channel) => channel.type === channelType);
            if (!typeChannels?.length) return null;

            return (
              <div key={channelType}>
                <h3 className="text-sm font-semibold mb-2 px-2 capitalize">
                  {channelType} Channels
                </h3>
                <motion.div variants={container} className="space-y-0.5">
                  {typeChannels.map((channel) => (
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
              </div>
            );
          })}
        </motion.div>
      </ScrollArea>
    </div>
  );
};
