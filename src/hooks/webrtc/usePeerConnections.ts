
import { useState, useRef } from 'react';

interface PeerConnectionConfig {
  channelId: string;
  localStream: MediaStream | null;
  onTrack?: (event: RTCTrackEvent, participantId: string) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
}

export const usePeerConnections = ({
  channelId,
  localStream,
  onTrack,
  onConnectionStateChange
}: PeerConnectionConfig) => {
  const [peerConnections] = useState<Map<string, RTCPeerConnection>>(new Map());
  const pendingIceCandidates = useRef<Map<string, RTCIceCandidate[]>>(new Map());

  const createPeerConnection = async (participantId: string) => {
    try {
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      };

      const pc = new RTCPeerConnection(configuration);
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('New ICE candidate:', event.candidate);
        }
      };

      pc.onconnectionstatechange = () => {
        console.log(`Connection state changed: ${pc.connectionState}`);
        onConnectionStateChange?.(pc.connectionState);
      };

      pc.ontrack = (event) => {
        console.log('Received remote track:', event);
        onTrack?.(event, participantId);
      };

      if (localStream) {
        localStream.getTracks().forEach(track => {
          pc.addTrack(track, localStream);
        });
      }

      peerConnections.set(participantId, pc);
      
      // Process any pending ICE candidates
      const candidates = pendingIceCandidates.current.get(participantId);
      if (candidates) {
        for (const candidate of candidates) {
          await pc.addIceCandidate(candidate);
        }
        pendingIceCandidates.current.delete(participantId);
      }

      return pc;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      return null;
    }
  };

  return {
    peerConnections,
    createPeerConnection,
    pendingIceCandidates: pendingIceCandidates.current
  };
};
