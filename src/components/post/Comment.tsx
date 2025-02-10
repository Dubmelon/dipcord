
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Reply, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import type { Comment as CommentType } from "@/types/comments";

interface CommentProps {
  comment: CommentType;
  currentUser: any;
  isReply?: boolean;
  onReply: (commentId: string) => void;
  onReaction: (commentId: string, type: 'like' | 'dislike') => void;
}

export const Comment = ({ 
  comment, 
  currentUser, 
  isReply = false, 
  onReply,
  onReaction 
}: CommentProps) => {
  const userReaction = comment.reactions?.find((r) => r.user_id === currentUser?.id)?.type;
  const likesCount = comment.reactions?.filter((r) => r.type === 'like').length || 0;
  const dislikesCount = comment.reactions?.filter((r) => r.type === 'dislike').length || 0;

  return (
    <div className={`flex gap-2 group ${isReply ? 'ml-8 mt-2' : 'mt-4'}`}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.user?.avatar_url ?? undefined} />
        <AvatarFallback>
          {comment.user?.username?.[0]?.toUpperCase() ?? "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="bg-background/5 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">
                {comment.user?.username}
              </span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(comment.created_at), "MMM d")}
              </span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm mt-1">{comment.content}</p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2"
            onClick={() => onReaction(comment.id, 'like')}
          >
            <ThumbsUp className={`h-4 w-4 mr-1 ${userReaction === 'like' ? 'fill-primary text-primary' : ''}`} />
            <span className="text-xs">{likesCount}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2"
            onClick={() => onReaction(comment.id, 'dislike')}
          >
            <ThumbsDown className={`h-4 w-4 mr-1 ${userReaction === 'dislike' ? 'fill-destructive text-destructive' : ''}`} />
            <span className="text-xs">{dislikesCount}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2"
            onClick={() => onReply(comment.id)}
          >
            <Reply className="h-4 w-4 mr-1" />
            <span className="text-xs">Reply</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
