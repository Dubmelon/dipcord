
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePosts = () => {
  const queryClient = useQueryClient();

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
          user_id: userId,
          media_urls: mediaUrls.length > 0 ? mediaUrls : null,
          embedded_media: embeddedMedia.length > 0 ? embeddedMedia : null
        }]);

      const endTime = performance.now();
      console.log(`[Feed] Post created in ${(endTime - startTime).toFixed(2)}ms`);

      if (error) {
        console.error("[Feed] Post creation error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("[Feed] Post creation successful");
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success("Post created successfully!");
    },
    onError: (error) => {
      console.error("[Feed] Post creation error:", error);
      toast.error("Failed to create post. Please try again.");
    },
  });

  const likePostMutation = useMutation({
    mutationFn: async ({ postId, userId }: { postId: string; userId: string }) => {
      if (!userId) {
        console.error("[Feed] No user ID available for liking post");
        throw new Error("User not authenticated");
      }

      console.log("[Feed] Liking post:", postId);
      const { error } = await supabase
        .from('likes')
        .insert([{ post_id: postId, user_id: userId }]);
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
    mutationFn: async ({ postId, userId }: { postId: string; userId: string }) => {
      if (!userId) {
        console.error("[Feed] No user ID available for unliking post");
        throw new Error("User not authenticated");
      }

      console.log("[Feed] Unliking post:", postId);
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
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

  return {
    posts,
    isLoading,
    createPostMutation,
    likePostMutation,
    unlikePostMutation
  };
};
