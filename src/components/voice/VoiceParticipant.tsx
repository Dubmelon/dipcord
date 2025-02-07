
import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { UserContextMenu } from "./UserContextMenu";

interface VoiceParticipantProps {
  username: string;
  avatarUrl?: string | null;
  isMuted?: boolean;
  isDeafened?: boolean;
}

export const VoiceParticipant = ({
  username,
  avatarUrl,
  isMuted,
  isDeafened
}: VoiceParticipantProps) => {
  return (
    <UserContextMenu 
      userId={username} 
      username={username}
      isMuted={isMuted}
      isDeafened={isDeafened}
    >
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
        <div className="relative">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl || ''} />
            <AvatarFallback>
              {username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <span className="flex-1 text-sm font-medium">
          {username}
        </span>
        
        <div className="flex items-center gap-2">
          {isMuted && <MicOff className="h-4 w-4 text-muted-foreground" />}
          {!isMuted && <Mic className="h-4 w-4 text-green-500" />}
        </div>
      </div>
    </UserContextMenu>
  );
};
