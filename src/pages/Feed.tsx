
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { CreatePost } from "@/components/feed/CreatePost";
import { PostList } from "@/components/feed/PostList";
import { useAuth } from "@/hooks/useAuth";
import { usePosts } from "@/hooks/usePosts";

const Feed = () => {
  console.log("[Feed] Initializing Feed component");
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const { posts, isLoading, createPostMutation, likePostMutation, unlikePostMutation } = usePosts();

  // Set up realtime subscription with debounced invalidation
  useEffect(() => {
    console.log("[Feed] Setting up realtime subscription");
    let invalidationTimeout: NodeJS.Timeout;

    const channel = supabase
      .channel('public:posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        (payload) => {
          console.log("[Feed] Realtime update received:", payload);
          // Debounce invalidation to prevent multiple rapid refreshes
          clearTimeout(invalidationTimeout);
          invalidationTimeout = setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
          }, 1000);
        }
      )
      .subscribe((status) => {
        console.log("[Feed] Realtime subscription status:", status);
      });

    return () => {
      console.log("[Feed] Cleaning up realtime subscription");
      clearTimeout(invalidationTimeout);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return (
    <div className="min-h-screen bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto p-4 max-w-2xl space-y-6">
        {currentUser && (
          <CreatePost
            currentUser={currentUser}
            onSubmit={async (content, mediaUrls) => {
              await createPostMutation.mutateAsync({ 
                content, 
                mediaUrls, 
                userId: currentUser.id 
              });
            }}
            isSubmitting={createPostMutation.isPending}
          />
        )}

        <PostList
          posts={posts}
          isLoading={isLoading}
          currentUser={currentUser}
          onLike={(postId) => likePostMutation.mutate({ postId, userId: currentUser?.id })}
          onUnlike={(postId) => unlikePostMutation.mutate({ postId, userId: currentUser?.id })}
        />
      </div>
    </div>
  );
};

export default Feed;
