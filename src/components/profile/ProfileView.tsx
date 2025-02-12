import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X, MoreHorizontal, Users, Hash, Music } from "lucide-react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";

interface ProfileViewProps {
  userId: string;
  onClose?: () => void;
}

type FriendRequestStatus = 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'rejected';

export const ProfileView = ({ userId, onClose }: ProfileViewProps) => {
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(false);
  const { data: profile, isLoading } = useProfile(userId);

  const { data: friendRequestStatus = 'none', isLoading: isFriendStatusLoading } = useQuery({
    queryKey: ['friend-request-status', userId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 'none';

      const { data: sentRequest } = await supabase
        .from('friend_requests')
        .select('status')
        .eq('sender_id', user.id)
        .eq('receiver_id', userId)
        .maybeSingle();

      const { data: receivedRequest } = await supabase
        .from('friend_requests')
        .select('status')
        .eq('sender_id', userId)
        .eq('receiver_id', user.id)
        .maybeSingle();

      if (sentRequest) {
        return sentRequest.status === 'pending' ? 'pending_sent' : sentRequest.status;
      }
      if (receivedRequest) {
        return receivedRequest.status === 'pending' ? 'pending_received' : receivedRequest.status;
      }
      return 'none';
    },
    enabled: !!userId,
  });

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

  const friendRequestMutation = useMutation({
    mutationFn: async ({ action }: { action: 'send' | 'accept' | 'reject' }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (action === 'send') {
        const { error } = await supabase
          .from('friend_requests')
          .insert([{ sender_id: user.id, receiver_id: userId }]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('friend_requests')
          .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
          .eq('sender_id', userId)
          .eq('receiver_id', user.id)
          .eq('status', 'pending');
        if (error) throw error;
      }
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['friend-request-status', userId] });
      toast.success(
        action === 'send' 
          ? "Friend request sent!" 
          : action === 'accept'
          ? "Friend request accepted!"
          : "Friend request rejected"
      );
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
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
          .insert([{ follower_id: user.id, following_id: userId }]);
        
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
      <div className="flex items-center justify-center h-[400px] w-[300px] bg-[#1A1F2C] rounded-lg">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const renderFriendRequestButton = () => {
    if (isFriendStatusLoading) {
      return (
        <Button disabled className="flex-1 h-8 text-sm font-medium">
          Loading...
        </Button>
      );
    }

    switch (friendRequestStatus) {
      case 'pending_sent':
        return (
          <Button 
            disabled
            className="flex-1 h-8 text-sm font-medium bg-[#1e1f22] text-[#dbdee1]"
          >
            Friend Request Sent
          </Button>
        );
      case 'pending_received':
        return (
          <div className="flex gap-2 flex-1">
            <Button 
              onClick={() => friendRequestMutation.mutate({ action: 'accept' })}
              className="flex-1 h-8 text-sm font-medium bg-[#248046] hover:bg-[#1a6334] text-white"
            >
              Accept
            </Button>
            <Button 
              onClick={() => friendRequestMutation.mutate({ action: 'reject' })}
              className="flex-1 h-8 text-sm font-medium bg-[#ed4245] hover:bg-[#a12d2f] text-white"
            >
              Reject
            </Button>
          </div>
        );
      case 'accepted':
        return (
          <Button 
            disabled
            className="flex-1 h-8 text-sm font-medium bg-[#248046] text-white"
          >
            Friends
          </Button>
        );
      case 'rejected':
      case 'none':
        return (
          <Button 
            onClick={() => friendRequestMutation.mutate({ action: 'send' })}
            className="flex-1 h-8 text-sm font-medium bg-[#248046] hover:bg-[#1a6334] text-white"
          >
            Add Friend
          </Button>
        );
    }
  };

  return (
    <div className="w-[300px] bg-[#1A1F2C] text-white rounded-lg overflow-hidden shadow-xl border border-[#403E43]/20">
      <div className="relative h-[60px] bg-[#221F26]">
        <div className="absolute top-2 right-2 flex gap-1">
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-[#C8C8C9]" />
          </button>
          <button className="p-1 hover:bg-white/5 rounded-full transition-colors">
            <MoreHorizontal className="h-5 w-5 text-[#C8C8C9]" />
          </button>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="relative -mt-[40px] mb-3">
          <Avatar className="h-[80px] w-[80px] border-[6px] border-[#1A1F2C] ring-2 ring-[#403E43]/20">
            <AvatarImage src={profile.avatar_url || ''} />
            <AvatarFallback className="text-2xl bg-[#221F26] text-[#9b87f5]">
              {profile.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {profile.is_online && (
            <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-[#9b87f5] border-[3px] border-[#1A1F2C]" />
          )}
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-[#C8C8C9]">{profile.username}</h2>
          <p className="text-sm text-[#8A898C]">@{profile.username}</p>
        </div>

        <div className="h-[1px] bg-[#403E43]/30 my-3" />

        {profile.bio && (
          <div className="mb-3">
            <h3 className="text-xs font-semibold uppercase text-[#8A898C] mb-1">About Me</h3>
            <p className="text-sm text-[#C8C8C9]">{profile.bio}</p>
          </div>
        )}

        <div className="mb-3">
          <h3 className="text-xs font-semibold uppercase text-[#8A898C] mb-1">Member Since</h3>
          <p className="text-sm text-[#C8C8C9]">
            {new Date(profile.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-[#8A898C] mb-3">
          <Users className="h-4 w-4" />
          <span>{profile.mutual_friends_count || 0} Mutual Friends</span>
          <span>•</span>
          <Hash className="h-4 w-4" />
          <span>{profile.mutual_servers_count || 0} Mutual Servers</span>
        </div>

        {profile.activity_status?.text && (
          <div className="mt-3 p-3 bg-[#221F26] rounded-lg border border-[#403E43]/20">
            <div className="flex items-center gap-2 text-sm text-[#C8C8C9] mb-2">
              <Music className="h-4 w-4 text-[#9b87f5]" />
              <span className="text-[#9b87f5]">{profile.activity_status.type}</span>
            </div>
            <p className="text-sm text-[#C8C8C9]">{profile.activity_status.text}</p>
            {profile.activity_status.emoji && (
              <span className="text-sm">{profile.activity_status.emoji}</span>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-3">
          {renderFriendRequestButton()}
          <Button 
            onClick={() => followMutation.mutate()}
            className={cn(
              "flex-1 h-8 text-sm font-medium transition-colors",
              isFollowing 
                ? "bg-[#221F26] hover:bg-[#403E43]/20 text-[#C8C8C9]" 
                : "bg-[#9b87f5] hover:bg-[#9b87f5]/80 text-white"
            )}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </Button>
        </div>
      </div>
    </div>
  );
};
