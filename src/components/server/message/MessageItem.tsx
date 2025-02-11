
import { format } from "date-fns";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import { MediaPreview } from "./MediaPreview";
import { UserContextMenu } from "@/components/shared/UserContextMenu";
import { MessageStatus } from "@/components/shared/MessageStatus";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ProfileView } from "@/components/profile/ProfileView";
import { useIsMobile } from "@/hooks/use-mobile";

interface MessageSender {
  id: string;
  username: string;
  avatar_url: string | null;
  is_online?: boolean;
}

interface MessageItemProps {
  id: string;
  content: string;
  created_at: string;
  sender: MessageSender | null;
  media_urls: string[] | null;
  isRead?: boolean;
  isDelivered?: boolean;
}

export const MessageItem = ({ 
  content, 
  created_at, 
  sender, 
  media_urls,
  isRead = false,
  isDelivered = true
}: MessageItemProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleProfileClick = () => {
    if (!isMobile && sender) {
      setIsProfileOpen(true);
    }
  };

  return (
    <>
      <div className="flex items-start hover:bg-black/30 px-4 py-2 transition-colors group">
        {sender && (
          <UserContextMenu userId={sender.id} isEnabled={!isMobile}>
            <div className="relative cursor-pointer">
              <Avatar className="w-10 h-10 shrink-0">
                <AvatarImage src={sender.avatar_url ?? undefined} />
                <AvatarFallback>
                  {sender.username?.substring(0, 2).toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              {sender.is_online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
              )}
            </div>
          </UserContextMenu>
        )}

        <div className="flex-1 min-w-0 ml-4">
          <div className="flex items-center gap-2">
            <span 
              className="font-semibold text-foreground hover:underline cursor-pointer"
              onClick={handleProfileClick}
            >
              {sender?.username ?? "Unknown User"}
            </span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(created_at), "M/d/yyyy h:mm a")}
            </span>
            {sender?.is_online && (
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                online
              </Badge>
            )}
            <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <MessageStatus isDelivered={isDelivered} isRead={isRead} />
              <Lock className="h-3 w-3 text-muted-foreground ml-1" />
            </div>
          </div>
          <p className="text-foreground/80 break-words">{content}</p>
          {media_urls && media_urls.length > 0 && (
            <div className="grid gap-2 mt-2 grid-cols-1 max-w-2xl">
              {media_urls.map((url, index) => (
                <MediaPreview key={index} url={url} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>

      {sender && (
        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <DialogContent>
            <DialogTitle>User Profile</DialogTitle>
            <ProfileView userId={sender.id} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
