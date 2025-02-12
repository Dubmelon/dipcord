
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message } from "@/types/messaging";
import { motion } from "framer-motion";
import { MediaPreview } from "@/components/server/message/MediaPreview";

interface MessageItemProps {
  message: Message;
}

export const MessageItem = ({ message }: MessageItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex items-start hover:bg-black/30 px-4 py-2 transition-colors group"
    >
      {message.sender && (
        <div className="relative cursor-pointer">
          <Avatar className="w-10 h-10 shrink-0">
            <AvatarImage src={message.sender.avatar_url ?? undefined} />
            <AvatarFallback>
              {message.sender.username?.substring(0, 2).toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          {message.sender.is_online && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          )}
        </div>
      )}

      <div className="flex-1 min-w-0 ml-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground hover:underline cursor-pointer">
            {message.sender?.username ?? "Unknown User"}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(message.created_at), "PPp")}
          </span>
        </div>
        <p className="text-foreground/80 break-words">{message.content}</p>
        {message.media_urls && message.media_urls.length > 0 && (
          <div className="grid gap-2 mt-2 grid-cols-1 max-w-2xl">
            {message.media_urls.map((url, index) => (
              <MediaPreview key={index} url={url} index={index} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
