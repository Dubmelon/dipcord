
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreatePost } from "@/components/feed/CreatePost";
import { PostCard } from "@/components/feed/PostCard";
import { PostSkeleton } from "@/components/feed/PostSkeleton";
import { motion, LazyMotion, domAnimation } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

const Feed = () => {
  console.log("[Feed] Initializing Feed component");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const isMobile = useIsMobile();

  // Memoize the auth check function
  const checkAuth = useCallback(async () => {
    console.log("[Feed] Checking authentication status");
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error("[Feed] Auth check error:", error);
      toast.error("Authentication error");
    }
    if (!session) {
      console.log("[Feed] No active session, redirecting to login");
      navigate("/");
    } else {
      console.log("[Feed] User authenticated:", session.user.id);
      setCurrentUser(session.user);
    }
  }, [navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Memoize the posts query
  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      console.log("[Feed] Fetching posts");
      const startTime = performance.now();

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:profiles!posts_user_id_fkey (
            username,
            avatar_url
          ),
          comments:comments (
            id,
            content,
            created_at,
            user:profiles!comments_user_id_fkey (
              id,
              username,
              avatar_url
            )
          ),
          likes:likes (
            id,
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      const endTime = performance.now();
      console.log(`[Feed] Posts fetched in ${(endTime - startTime).toFixed(2)}ms`);

      if (error) {
        console.error("[Feed] Post fetch error:", error);
        throw error;
      }

      console.log("[Feed] Fetched posts count:", data?.length);
      return data;
    },
    staleTime: 30000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const createPostMutation = useMutation({
    mutationFn: async ({ content, mediaUrls }: { content: string; mediaUrls: string[] }) => {
      console.log("[Feed] Creating new post", { content, mediaUrls });
      const startTime = performance.now();

      const urls = content.match(/(https?:\/\/[^\s]+)/g) || [];
      const embeddedMedia = urls.map(url => ({
        url,
        type: url.includes('youtube.com') || url.includes('youtu.be') ? 'youtube' :
              url.includes('medal.tv') ? 'medal' : 'link'
      }));

      const { error } = await supabase
        .from('posts')
        .insert([{ 
          content, 
          user_id: currentUser.id,
          media_urls: mediaUrls.length > 0 ? mediaUrls : null,
          embedded_media: embeddedMedia.length > 0 ? embeddedMedia : null
        }]);

      const endTime = performance.now();
      console.log(`[Feed] Post created in ${(endTime - startTime).toFixed(2)}ms`);

      if (error) throw error;
    },
    onSuccess: () => {
      console.log("[Feed] Post creation successful");
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success("Post created successfully!");
    },
    onError: (error) => {
      console.error("[Feed] Post creation error:", error);
      toast.error("Failed to create post");
    },
  });

  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      console.log("[Feed] Liking post:", postId);
      const { error } = await supabase
        .from('likes')
        .insert([{ post_id: postId, user_id: currentUser.id }]);
      if (error) throw error;
    },
    onSuccess: () => {
      console.log("[Feed] Post like successful");
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error("[Feed] Post like error:", error);
      toast.error("Failed to like post");
    },
  });

  const unlikePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      console.log("[Feed] Unliking post:", postId);
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', currentUser.id);
      if (error) throw error;
    },
    onSuccess: () => {
      console.log("[Feed] Post unlike successful");
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error("[Feed] Post unlike error:", error);
      toast.error("Failed to unlike post");
    },
  });

  // Set up realtime subscription
  useEffect(() => {
    console.log("[Feed] Setting up realtime subscription");
    const channel = supabase
      .channel('public:posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        (payload) => {
          console.log("[Feed] Realtime update received:", payload);
          queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
      )
      .subscribe((status) => {
        console.log("[Feed] Realtime subscription status:", status);
      });

    return () => {
      console.log("[Feed] Cleaning up realtime subscription");
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Memoize the rendered posts
  const renderedPosts = useMemo(() => (
    posts?.map((post: any, index: number) => (
      <motion.div
        key={post.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          delay: index * 0.1,
          ease: "easeOut"
        }}
        style={{ 
          willChange: 'transform, opacity',
          transform: 'translateZ(0)'
        }}
      >
        <PostCard
          post={post}
          currentUser={currentUser}
          onLike={() => likePostMutation.mutate(post.id)}
          onUnlike={() => unlikePostMutation.mutate(post.id)}
          onShare={() => {
            navigator.clipboard.writeText(
              `${window.location.origin}/posts/${post.id}`
            );
            toast.success("Link copied to clipboard!");
          }}
        />
      </motion.div>
    ))
  ), [posts, currentUser, likePostMutation, unlikePostMutation]);

  return (
    <div className="min-h-screen bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto p-4 max-w-2xl space-y-6">
        <CreatePost
          currentUser={currentUser}
          onSubmit={async (content, mediaUrls) => {
            await createPostMutation.mutateAsync({ content, mediaUrls });
          }}
          isSubmitting={createPostMutation.isPending}
        />

        <LazyMotion features={domAnimation}>
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <PostSkeleton />
                </motion.div>
              ))
            ) : (
              renderedPosts
            )}
          </motion.div>
        </LazyMotion>
      </div>
    </div>
  );
};

export default Feed;
