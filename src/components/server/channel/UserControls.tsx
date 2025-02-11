
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mic, Headphones, Settings2 } from "lucide-react";
import type { UserControlsProps } from "./types";

export const UserControls = ({ serverId, currentUser }: UserControlsProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="mt-auto border-t border-border bg-background/95 backdrop-blur-md p-2">
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
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
