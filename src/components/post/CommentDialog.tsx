
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Comment } from "./Comment";
import { CommentInput } from "./CommentInput";
import type { Comment as CommentType, CommentThread } from "@/types/comments";

interface CommentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  comments: CommentType[];
  currentUser: any;
}

export const CommentDialog = ({ 
  isOpen, 
  onClose, 
  postId, 
  comments: initialComments, 
  currentUser 
}: CommentDialogProps) => {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data: comments, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          updated_at,
          post_id,
          user_id,
          parent_comment_id,
          likes_count,
          dislikes_count,
          user:profiles!comments_user_id_fkey (
            id,
            username,
            avatar_url
          ),
          reactions:comment_reactions (*)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return comments as CommentType[];
    },
    initialData: initialComments,
  });

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
          likes_count: 0,
          dislikes_count: 0,
        });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
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
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: (error) => {
      toast.error("Failed to update reaction. Please try again.");
      console.error("Reaction error:", error);
    },
  });

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    await createCommentMutation.mutateAsync({ 
      content: newComment,
      parentCommentId: replyingTo
    });
  };

  // Group comments by parent_comment_id
  const commentThreads = comments.reduce((acc: Record<string, CommentThread>, comment: CommentType) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
          <DialogDescription>
            View and add comments to this post
          </DialogDescription>
        </DialogHeader>
        
        {/* Comments List */}
        <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto">
          {Object.values(commentThreads).map((thread) => (
            <div key={thread.id} className="space-y-2">
              <Comment 
                comment={thread}
                currentUser={currentUser}
                onReply={setReplyingTo}
                onReaction={(commentId, type) => toggleReactionMutation.mutate({ commentId, type })}
              />
              {thread.replies?.map((reply) => (
                <Comment 
                  key={reply.id}
                  comment={reply}
                  currentUser={currentUser}
                  isReply
                  onReply={setReplyingTo}
                  onReaction={(commentId, type) => toggleReactionMutation.mutate({ commentId, type })}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Comment Input */}
        {isEditing && (
          <CommentInput
            currentUser={currentUser}
            value={newComment}
            onChange={setNewComment}
            onSubmit={handleSubmitComment}
            onCancel={replyingTo ? () => {
              setReplyingTo(null);
              setIsEditing(false);
            } : undefined}
            isReply={!!replyingTo}
          />
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

