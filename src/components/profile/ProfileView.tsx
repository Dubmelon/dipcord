
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X, MoreHorizontal, Users, Hash, Music } from "lucide-react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import type { Profile } from "@/types/profile";
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

  // Query friend request status
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
      <div className="flex items-center justify-center h-[400px] w-[300px]">
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
    <div className="w-[300px] bg-[#232428] text-white rounded-lg overflow-hidden">
      {/* Header */}
      <div className="relative h-[60px] bg-[#1e1f22]">
        <div className="absolute top-2 right-2 flex gap-1">
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <button className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="px-4 pb-4">
        {/* Avatar */}
        <div className="relative -mt-[40px] mb-3">
          <Avatar className="h-[80px] w-[80px] border-[6px] border-[#232428]">
            <AvatarImage src={profile.avatar_url || ''} />
            <AvatarFallback className="text-2xl bg-[#2b2d31]">
              {profile.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {profile.is_online && (
            <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-500 border-[3px] border-[#232428]" />
          )}
        </div>

        {/* User Info */}
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">{profile.username}</h2>
          <p className="text-sm text-[#949ba4]">@{profile.username}</p>
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-[#3f4147] my-3" />

        {/* About Me */}
        {profile.bio && (
          <div className="mb-3">
            <h3 className="text-xs font-semibold uppercase text-[#949ba4] mb-1">About Me</h3>
            <p className="text-sm text-[#dbdee1]">{profile.bio}</p>
          </div>
        )}

        {/* Member Since */}
        <div className="mb-3">
          <h3 className="text-xs font-semibold uppercase text-[#949ba4] mb-1">Member Since</h3>
          <p className="text-sm text-[#dbdee1]">
            {new Date(profile.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Mutual Info */}
        <div className="flex items-center gap-2 text-sm text-[#949ba4] mb-3">
          <Users className="h-4 w-4" />
          <span>{profile.mutual_friends_count || 0} Mutual Friends</span>
          <span>•</span>
          <Hash className="h-4 w-4" />
          <span>{profile.mutual_servers_count || 0} Mutual Servers</span>
        </div>

        {/* Activity Status */}
        {profile.activity_status?.text && (
          <div className="mt-3 p-3 bg-[#1e1f22] rounded-[4px]">
            <div className="flex items-center gap-2 text-sm text-[#dbdee1] mb-2">
              <Music className="h-4 w-4 text-[#248046]" />
              <span className="text-[#248046]">{profile.activity_status.type}</span>
            </div>
            <p className="text-sm text-[#dbdee1]">{profile.activity_status.text}</p>
            {profile.activity_status.emoji && (
              <span className="text-sm">{profile.activity_status.emoji}</span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3">
          {renderFriendRequestButton()}
          <Button 
            onClick={() => followMutation.mutate()}
            className={cn(
              "flex-1 h-8 text-sm font-medium",
              isFollowing 
                ? "bg-[#1e1f22] hover:bg-[#2b2d31] text-[#dbdee1]" 
                : "bg-[#248046] hover:bg-[#1a6334] text-white"
            )}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </Button>
        </div>
      </div>
    </div>
  );
};

