
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProfileUpdate } from "@/types/profile";

interface ProfileSettingsProps {
  profile: any;
  isLoading: boolean;
}

export const ProfileSettings = ({ profile, isLoading }: ProfileSettingsProps) => {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState(profile?.username || "");
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [aboutMarkdown, setAboutMarkdown] = useState(profile?.about_markdown || "");
  const [accentColor, setAccentColor] = useState(profile?.accent_color || "");
  const [statusEmoji, setStatusEmoji] = useState(profile?.status_emoji || "");
  const [statusText, setStatusText] = useState(profile?.status_text || "");
  const [themePreference, setThemePreference] = useState(profile?.theme_preference || "dark");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: ProfileUpdate) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleFileUpload = async (file: File, type: 'avatar' | 'banner') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const bucketName = type === 'avatar' ? 'posts' : 'profile-banners';

    const { error: uploadError, data } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    if (data) {
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);
      return publicUrl;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let avatarUrl = profile?.avatar_url;
      let bannerUrl = profile?.banner_url;

      if (avatarFile) {
        avatarUrl = await handleFileUpload(avatarFile, 'avatar');
      }

      if (bannerFile) {
        bannerUrl = await handleFileUpload(bannerFile, 'banner');
      }

      await updateProfileMutation.mutateAsync({ 
        username, 
        full_name: fullName,
        bio,
        about_markdown: aboutMarkdown,
        accent_color: accentColor,
        status_emoji: statusEmoji,
        status_text: statusText,
        theme_preference: themePreference as 'dark' | 'light',
        ...(avatarUrl && { avatar_url: avatarUrl }),
        ...(bannerUrl && { banner_url: bannerUrl })
      });
    } catch (error) {
      toast.error("Error updating profile");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback>{username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                className="max-w-xs"
                id="avatar-upload"
                name="avatar-upload"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Profile Banner</Label>
            <div className="flex items-center gap-4">
              {profile?.banner_url && (
                <img 
                  src={profile.banner_url} 
                  alt="Profile banner" 
                  className="h-20 w-40 object-cover rounded-md"
                />
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                className="max-w-xs"
                id="banner-upload"
                name="banner-upload"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aboutMarkdown">About (Markdown)</Label>
            <Textarea
              id="aboutMarkdown"
              name="aboutMarkdown"
              value={aboutMarkdown}
              onChange={(e) => setAboutMarkdown(e.target.value)}
              placeholder="Write about yourself in markdown"
              className="min-h-[150px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accentColor">Accent Color</Label>
            <Input
              id="accentColor"
              name="accentColor"
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="statusEmoji">Status Emoji</Label>
            <Input
              id="statusEmoji"
              name="statusEmoji"
              value={statusEmoji}
              onChange={(e) => setStatusEmoji(e.target.value)}
              placeholder="Enter an emoji"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="statusText">Status Text</Label>
            <Input
              id="statusText"
              name="statusText"
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              placeholder="What's on your mind?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="themePreference">Theme Preference</Label>
            <Select 
              value={themePreference} 
              onValueChange={(value) => setThemePreference(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isUploading}>
            {isUploading ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
