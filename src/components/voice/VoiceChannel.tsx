
import { useEffect, useState } from "react";
import { VoiceParticipantList } from "./VoiceParticipantList";
import { VoiceControls } from "./VoiceControls";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface VoiceChannelProps {
  channelId: string;
}

export const VoiceChannel = ({ channelId }: VoiceChannelProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const queryClient = useQueryClient();

  const joinChannel = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: existingParticipant } = await supabase
        .from('voice_channel_participants')
        .select('*')
        .eq('channel_id', channelId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingParticipant) {
        const { error } = await supabase
          .from('voice_channel_participants')
          .update({ 
            connection_state: 'connected',
            is_muted: false,
            is_deafened: false,
            last_heartbeat: new Date().toISOString()
          })
          .eq('channel_id', channelId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('voice_channel_participants')
          .insert({
            channel_id: channelId,
            user_id: user.id,
            connection_state: 'connected'
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-participants', channelId] });
      setIsConnected(true);
      toast.success("Joined voice channel");
    },
    onError: (error: Error) => {
      toast.error(`Failed to join channel: ${error.message}`);
      setIsConnecting(false);
    },
  });

  const leaveChannel = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('voice_channel_participants')
        .update({ 
          connection_state: 'disconnected',
          is_muted: false,
          is_deafened: false
        })
        .eq('channel_id', channelId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-participants', channelId] });
      setIsConnected(false);
      toast.success("Left voice channel");
    },
    onError: (error: Error) => {
      toast.error(`Failed to leave channel: ${error.message}`);
    },
  });

  useEffect(() => {
    const handleUnload = async () => {
      if (isConnected) {
        await leaveChannel.mutateAsync();
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      if (isConnected) {
        leaveChannel.mutate();
      }
    };
  }, [isConnected, channelId]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <VoiceParticipantList channelId={channelId} />
      </div>
      {!isConnected ? (
        <div className="p-4 border-t border-white/10">
          <button
            onClick={async () => {
              setIsConnecting(true);
              try {
                await joinChannel.mutateAsync();
              } catch (error: any) {
                console.error('Failed to join voice channel:', error);
                toast.error(error.message);
              } finally {
                setIsConnecting(false);
              }
            }}
            disabled={isConnecting}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Connecting...</span>
              </div>
            ) : (
              "Join Voice"
            )}
          </button>
        </div>
      ) : (
        <>
          <VoiceControls
            channelId={channelId}
            onMuteChange={() => {}}
            onDeafenChange={() => {}}
          />
          <div className="p-4 border-t border-white/10">
            <button
              onClick={() => leaveChannel.mutate()}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </>
      )}
    </div>
  );
};
