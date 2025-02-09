
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { CreatePost } from "@/components/feed/CreatePost";
import { PostList } from "@/components/feed/PostList";
import { useAuth } from "@/hooks/useAuth";
import { usePosts } from "@/hooks/usePosts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

type FeedType = 'for_you' | 'following' | 'all';

const Feed = () => {
  console.log("[Feed] Initializing Feed component");
  const [activeTab, setActiveTab] = useState<FeedType>('for_you');
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const { posts, isLoading, createPostMutation, likePostMutation, unlikePostMutation } = usePosts(activeTab);

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
          clearTimeout(invalidationTimeout);
          invalidationTimeout = setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['posts', activeTab] });
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
  }, [queryClient, activeTab]);

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

        <Card className="p-1">
          <Tabs defaultValue="for_you" onValueChange={(value) => setActiveTab(value as FeedType)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="for_you">For You</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
              <TabsTrigger value="all">All Posts</TabsTrigger>
            </TabsList>
            <TabsContent value="for_you" className="space-y-4">
              <PostList
                posts={posts}
                isLoading={isLoading}
                currentUser={currentUser}
                onLike={(postId) => likePostMutation.mutate({ postId, userId: currentUser?.id })}
                onUnlike={(postId) => unlikePostMutation.mutate({ postId, userId: currentUser?.id })}
              />
            </TabsContent>
            <TabsContent value="following" className="space-y-4">
              <PostList
                posts={posts}
                isLoading={isLoading}
                currentUser={currentUser}
                onLike={(postId) => likePostMutation.mutate({ postId, userId: currentUser?.id })}
                onUnlike={(postId) => unlikePostMutation.mutate({ postId, userId: currentUser?.id })}
              />
            </TabsContent>
            <TabsContent value="all" className="space-y-4">
              <PostList
                posts={posts}
                isLoading={isLoading}
                currentUser={currentUser}
                onLike={(postId) => likePostMutation.mutate({ postId, userId: currentUser?.id })}
                onUnlike={(postId) => unlikePostMutation.mutate({ postId, userId: currentUser?.id })}
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Feed;
