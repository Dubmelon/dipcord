
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useForYouPosts = () => {
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts', 'for_you'],
    queryFn: async () => {
      console.log("[Feed] Fetching recommended posts");
      const startTime = performance.now();

      const { data, error } = await supabase
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
          user:profiles!posts_user_id_fkey (
            id,
            username,
            avatar_url
          ),
          likes!left (
            user_id
          )
        `)
        .order('post_score', { ascending: false })
        .limit(20);

      const endTime = performance.now();
      console.log(`[Feed] Posts fetched in ${(endTime - startTime).toFixed(2)}ms`);

      if (error) {
        console.error("[Feed] Post fetch error:", error);
        throw error;
      }

      return data || [];
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const likePostMutation = useMutation({
    mutationFn: async ({ postId, userId }: { postId: string; userId: string }) => {
      if (!userId) throw new Error("User not authenticated");
      
      console.log("[Feed] Liking post:", postId);
      
      queryClient.setQueryData(['posts', 'for_you'], (oldPosts: any[] = []) => {
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
        queryClient.invalidateQueries({ queryKey: ['posts', 'for_you'] });
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
      
      queryClient.setQueryData(['posts', 'for_you'], (oldPosts: any[] = []) => {
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
        queryClient.invalidateQueries({ queryKey: ['posts', 'for_you'] });
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
    likePostMutation,
    unlikePostMutation
  };
};
