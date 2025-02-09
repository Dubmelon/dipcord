
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type FeedType = 'all' | 'following' | 'for_you';

export const usePosts = (feedType: FeedType = 'all') => {
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts', feedType],
    queryFn: async () => {
      console.log("[Feed] Fetching posts for feed type:", feedType);
      const startTime = performance.now();

      let query = supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          media_urls,
          embedded_media,
          is_edited,
          likes_count,
          comments_count,
          post_score,
          user_id,
          likes!left (
            user_id
          )
        `);

      if (feedType === 'following') {
        // Get posts from users that the current user follows
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data: followingIds } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id);

        if (followingIds && followingIds.length > 0) {
          query = query.in('user_id', followingIds.map(f => f.following_id));
        } else {
          // If not following anyone, return empty array
          return [];
        }
      } else if (feedType === 'for_you') {
        // Order by post_score for recommended posts
        query = query.order('post_score', { ascending: false });
      }

      // Add final ordering and limit
      query = query
        .order('created_at', { ascending: false })
        .limit(20);

      const { data, error } = await query;

      const endTime = performance.now();
      console.log(`[Feed] Posts fetched in ${(endTime - startTime).toFixed(2)}ms`);

      if (error) {
        console.error("[Feed] Post fetch error:", error);
        throw error;
      }

      console.log("[Feed] Fetched posts count:", data?.length);
      return data || [];
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const createPostMutation = useMutation({
    mutationFn: async ({ content, mediaUrls, userId }: { content: string; mediaUrls: string[]; userId: string }) => {
      console.log("[Feed] Creating new post", { content, mediaUrls });
      const startTime = performance.now();

      if (!userId) {
        console.error("[Feed] No user ID available for post creation");
        throw new Error("User not authenticated");
      }

      // Extract and process embedded media (YouTube, Medal.tv links)
      const urls = content.match(/(https?:\/\/[^\s]+)/g) || [];
      const embeddedMedia = urls.map(url => ({
        url,
        type: url.includes('youtube.com') || url.includes('youtu.be') ? 'youtube' :
              url.includes('medal.tv') ? 'medal' : 'link'
      }));

      const { data, error } = await supabase
        .from('posts')
        .insert([{ 
          content, 
          user_id: userId,
          media_urls: mediaUrls.length > 0 ? mediaUrls : null,
          embedded_media: embeddedMedia.length > 0 ? embeddedMedia : null
        }])
        .select()
        .single();

      const endTime = performance.now();
      console.log(`[Feed] Post created in ${(endTime - startTime).toFixed(2)}ms`);

      if (error) {
        console.error("[Feed] Post creation error:", error);
        throw error;
      }

      return data;
    },
    onSuccess: (newPost) => {
      console.log("[Feed] Post creation successful");
      queryClient.setQueryData(['posts'], (oldPosts: any[] = []) => [newPost, ...oldPosts]);
      toast.success("Post created successfully!");
    },
    onError: (error) => {
      console.error("[Feed] Post creation error:", error);
      toast.error("Failed to create post. Please try again.");
    },
  });

  const likePostMutation = useMutation({
    mutationFn: async ({ postId, userId }: { postId: string; userId: string }) => {
      if (!userId) throw new Error("User not authenticated");

      console.log("[Feed] Liking post:", postId);
      
      // Optimistically update the likes count and likes array
      queryClient.setQueryData(['posts'], (oldPosts: any[] = []) => {
        return oldPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likes_count: (post.likes_count || 0) + 1,
              likes: [...(post.likes || []), { user_id: userId }]
            };
          }
          return post;
        });
      });

      const { error } = await supabase
        .from('likes')
        .insert([{ post_id: postId, user_id: userId }]);
      
      if (error) {
        // Revert optimistic update on error
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        throw error;
      }
    },
    onError: (error) => {
      console.error("[Feed] Post like error:", error);
      toast.error("Failed to like post");
    },
  });

  const unlikePostMutation = useMutation({
    mutationFn: async ({ postId, userId }: { postId: string; userId: string }) => {
      if (!userId) throw new Error("User not authenticated");

      console.log("[Feed] Unliking post:", postId);
      
      // Optimistically update the likes count and likes array
      queryClient.setQueryData(['posts'], (oldPosts: any[] = []) => {
        return oldPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likes_count: Math.max((post.likes_count || 0) - 1, 0),
              likes: (post.likes || []).filter((like: any) => like.user_id !== userId)
            };
          }
          return post;
        });
      });

      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
      
      if (error) {
        // Revert optimistic update on error
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        throw error;
      }
    },
    onError: (error) => {
      console.error("[Feed] Post unlike error:", error);
      toast.error("Failed to unlike post");
    },
  });

  return {
    posts,
    isLoading,
    createPostMutation,
    likePostMutation,
    unlikePostMutation
  };
};
