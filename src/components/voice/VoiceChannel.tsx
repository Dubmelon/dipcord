import { useEffect, useState } from "react";
import { VoiceParticipantList } from "./VoiceParticipantList";
import { VoiceControls } from "./VoiceControls";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useWebRTC } from "@/hooks/useWebRTC";
import { VoiceParticipant } from "./VoiceParticipant";

interface VoiceChannelProps {
  channelId: string;
}

export const VoiceChannel = ({ channelId }: VoiceChannelProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState(new Map());
  const queryClient = useQueryClient();

  const { isInitialized, initializeWebRTC, cleanup, localStream } = useWebRTC({
    channelId,
    onTrack: (event, participantId) => {
      const [stream] = event.streams;
      if (!stream) return;
      
      setParticipants(prev => new Map(prev).set(participantId, {
        stream,
        isSpeaking: false
      }));
    }
  });

  // Check if user is already in the channel
  const { data: existingParticipant } = useQuery({
    queryKey: ['voice-participant', channelId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('voice_channel_participants')
        .select('*')
        .eq('channel_id', channelId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!channelId,
  });

  const joinChannel = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (existingParticipant) {
        return existingParticipant;
      }

      const { data, error } = await supabase
        .from('voice_channel_participants')
        .insert([
          {
            channel_id: channelId,
            user_id: user.id,
            is_muted: false,
            is_deafened: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-participants', channelId] });
      queryClient.invalidateQueries({ queryKey: ['voice-participant', channelId] });
      toast.success("Joined voice channel");
    },
    onError: (error: Error) => {
      toast.error(`Failed to join channel: ${error.message}`);
    },
  });

  const leaveChannel = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('voice_channel_participants')
        .delete()
        .eq('channel_id', channelId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-participants', channelId] });
      queryClient.invalidateQueries({ queryKey: ['voice-participant', channelId] });
      toast.success("Left voice channel");
    },
    onError: (error: Error) => {
      toast.error(`Failed to leave channel: ${error.message}`);
    },
  });

  const handleMuteChange = (isMuted: boolean) => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted;
      });
    }
  };

  const handleDeafenChange = (isDeafened: boolean) => {
    participants.forEach(({ stream }) => {
      if (stream) {
        stream.getAudioTracks().forEach(track => {
          track.enabled = !isDeafened;
        });
      }
    });
  };

  useEffect(() => {
    if (existingParticipant) {
      setIsConnected(true);
    }

    return () => {
      cleanup();
    };
  }, [existingParticipant]);

  // Set up real-time updates for voice participants
  useEffect(() => {
    const channel = supabase
      .channel(`voice-${channelId}`)
      .on('presence', { event: 'sync' }, () => {
        console.log('Voice presence synced');
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('New participant joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('Participant left:', leftPresences);
        leftPresences.forEach((presence: any) => {
          setParticipants(prev => {
            const next = new Map(prev);
            next.delete(presence.user_id);
            return next;
          });
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <VoiceParticipantList channelId={channelId} />
        {Array.from(participants.entries()).map(([participantId, { stream }]) => (
          <VoiceParticipant
            key={participantId}
            username="Remote User"
            stream={stream}
          />
        ))}
      </div>
      {!isConnected ? (
        <div className="p-4 border-t border-white/10">
          <button
            onClick={async () => {
              await initializeWebRTC();
              joinChannel.mutate();
            }}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            Join Voice
          </button>
        </div>
      ) : (
        <>
          <VoiceControls
            channelId={channelId}
            onMuteChange={handleMuteChange}
            onDeafenChange={handleDeafenChange}
          />
          <div className="p-4 border-t border-white/10">
            <button
              onClick={() => {
                cleanup();
                leaveChannel.mutate();
              }}
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
