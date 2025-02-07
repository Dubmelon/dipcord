
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SignalingConfig {
  channelId: string;
  onSignalingMessage: (message: any) => void;
}

export const useSignaling = ({ channelId, onSignalingMessage }: SignalingConfig) => {
  useEffect(() => {
    const channel = supabase.channel(`voip:${channelId}`, {
      config: {
        broadcast: {
          self: false
        }
      }
    });

    channel
      .on('broadcast', { event: 'signaling' }, ({ payload }) => {
        console.log('Received signaling message:', payload);
        onSignalingMessage(payload);
      })
      .subscribe((status) => {
        console.log('Signaling channel status:', status);
      });

    return () => {
      channel.unsubscribe();
    };
  }, [channelId, onSignalingMessage]);

  const sendSignal = async (targetId: string, type: string, payload: any) => {
    const { error } = await supabase.channel(`voip:${channelId}`).send({
      type: 'broadcast',
      event: 'signaling',
      payload: {
        type,
        payload,
        sender_id: (await supabase.auth.getUser()).data.user?.id,
        target_id: targetId
      }
    });

    if (error) {
      console.error('Error sending signal:', error);
      throw error;
    }
  };

  return { sendSignal };
};
