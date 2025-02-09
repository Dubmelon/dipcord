
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, Reply, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CommentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  comments: any[];
  currentUser: any;
}

export const CommentDialog = ({ isOpen, onClose, postId, comments, currentUser }: CommentDialogProps) => {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const createCommentMutation = useMutation({
    mutationFn: async ({ content, parentCommentId }: { content: string; parentCommentId?: string }) => {
      if (!currentUser) throw new Error("Must be logged in to comment");

      const { error: insertError } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          user_id: currentUser.id,
          content,
          parent_comment_id: parentCommentId,
        });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setNewComment("");
      setReplyingTo(null);
      setIsEditing(false);
      toast.success("Comment added successfully!");
    },
    onError: (error) => {
      toast.error("Failed to add comment. Please try again.");
      console.error("Comment error:", error);
    },
  });

  const toggleReactionMutation = useMutation({
    mutationFn: async ({ commentId, type }: { commentId: string; type: 'like' | 'dislike' }) => {
      if (!currentUser) throw new Error("Must be logged in to react");

      const { data: existingReaction } = await supabase
        .from("comment_reactions")
        .select()
        .eq("comment_id", commentId)
        .eq("user_id", currentUser.id)
        .single();

      if (existingReaction) {
        if (existingReaction.type === type) {
          const { error } = await supabase
            .from("comment_reactions")
            .delete()
            .eq("id", existingReaction.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("comment_reactions")
            .update({ type })
            .eq("id", existingReaction.id);
          if (error) throw error;
        }
      } else {
        const { error } = await supabase
          .from("comment_reactions")
          .insert({
            comment_id: commentId,
            user_id: currentUser.id,
            type,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error("Failed to update reaction. Please try again.");
      console.error("Reaction error:", error);
    },
  });

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await createCommentMutation.mutateAsync({ 
      content: newComment,
      parentCommentId: replyingTo
    });
  };

  // Group comments by parent_comment_id
  const commentThreads = comments.reduce((acc: any, comment: any) => {
    if (!comment.parent_comment_id) {
      if (!acc[comment.id]) {
        acc[comment.id] = {
          ...comment,
          replies: []
        };
      }
    } else {
      const parentThread = acc[comment.parent_comment_id];
      if (parentThread) {
        parentThread.replies.push(comment);
      }
    }
    return acc;
  }, {});

  const CommentComponent = ({ comment, isReply = false }: { comment: any; isReply?: boolean }) => (
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
            onClick={() => toggleReactionMutation.mutate({ commentId: comment.id, type: 'like' })}
          >
            <ThumbsUp className={`h-4 w-4 mr-1 ${comment.likes_count > 0 ? 'fill-primary text-primary' : ''}`} />
            <span className="text-xs">{comment.likes_count || 0}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2"
            onClick={() => toggleReactionMutation.mutate({ commentId: comment.id, type: 'dislike' })}
          >
            <ThumbsDown className={`h-4 w-4 mr-1 ${comment.dislikes_count > 0 ? 'fill-destructive text-destructive' : ''}`} />
            <span className="text-xs">{comment.dislikes_count || 0}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2"
            onClick={() => setReplyingTo(comment.id)}
          >
            <Reply className="h-4 w-4 mr-1" />
            <span className="text-xs">Reply</span>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background border-border">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
          <DialogDescription>
            View and add comments to this post
          </DialogDescription>
        </DialogHeader>
        
        {/* Comments List */}
        <div className="space-y-4 mt-4">
          {Object.values(commentThreads).map((thread: any) => (
            <div key={thread.id}>
              <CommentComponent comment={thread} />
              {thread.replies.map((reply: any) => (
                <CommentComponent key={reply.id} comment={reply} isReply />
              ))}
            </div>
          ))}
        </div>

        {/* Comment Input - Only shown when clicking to edit */}
        {isEditing && (
          <form onSubmit={handleSubmitComment} className="flex gap-2 mt-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser?.user_metadata?.avatar_url} />
              <AvatarFallback>
                {currentUser?.email?.[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
                className="min-h-[40px] resize-none"
                rows={3}
              />
              <div className="flex justify-between items-center mt-2">
                {replyingTo && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setReplyingTo(null);
                      setIsEditing(false);
                    }}
                  >
                    Cancel Reply
                  </Button>
                )}
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newComment.trim()}
                  className="ml-auto"
                >
                  {replyingTo ? "Reply" : "Comment"}
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Add Comment Button */}
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="w-full mt-4"
          >
            Write a comment...
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};
