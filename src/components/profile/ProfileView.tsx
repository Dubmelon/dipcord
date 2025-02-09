import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import type { Profile } from "@/types/profile";

interface ProfileViewProps {
  userId: string;
  onClose?: () => void;
}

export const ProfileView = ({ userId, onClose }: ProfileViewProps) => {
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(false);
  const { data: profile, isLoading } = useProfile(userId);

  const { data: followStatus } = useQuery({
    queryKey: ['follow-status', userId],
    queryFn: async () => {
      if (!userId) return false;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .maybeSingle();

      if (error) throw error;
      setIsFollowing(!!data);
      return !!data;
    },
    enabled: !!userId,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("User ID is required");
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('follows')
          .insert([
            { follower_id: user.id, following_id: userId }
          ]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      setIsFollowing(!isFollowing);
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['follow-status', userId] });
      toast.success(isFollowing ? "Unfollowed successfully" : "Followed successfully");
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto glass-morphism">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.avatar_url || ''} />
            <AvatarFallback>
              {profile.username?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="text-2xl font-bold text-white">
          {profile.full_name || profile.username}
        </CardTitle>
        <p className="text-sm text-white/60">@{profile.username}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {profile.bio && (
          <p className="text-white/80 text-center">{profile.bio}</p>
        )}
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            className="w-full max-w-[200px] hover:bg-white/10"
            onClick={() => followMutation.mutate()}
            disabled={followMutation.isPending}
          >
            {followMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isFollowing ? (
              <>
                <UserMinus className="h-4 w-4 mr-2" />
                Unfollow
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Follow
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
