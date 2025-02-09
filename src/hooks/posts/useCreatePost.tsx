
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCreatePost = () => {
  const queryClient = useQueryClient();

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
      // Update all feed types
      ['all', 'following', 'for_you'].forEach(feedType => {
        queryClient.setQueryData(['posts', feedType], (oldPosts: any[] = []) => [newPost, ...oldPosts]);
      });
      toast.success("Post created successfully!");
    },
    onError: (error) => {
      console.error("[Feed] Post creation error:", error);
      toast.error("Failed to create post. Please try again.");
    },
  });

  return createPostMutation;
};
