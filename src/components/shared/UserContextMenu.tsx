
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { ProfileView } from "@/components/profile/ProfileView";
import { useProfile } from "@/hooks/useProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

interface UserContextMenuProps {
  userId: string;
  children: React.ReactNode;
  isEnabled?: boolean;
}

// Store user preference in localStorage
const getStoredPreference = (): boolean => {
  const stored = localStorage.getItem('useCustomContextMenu');
  return stored === null ? true : stored === 'true';
};

export const UserContextMenu = ({ userId, children, isEnabled = true }: UserContextMenuProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showPreferenceDialog, setShowPreferenceDialog] = useState(!localStorage.getItem('useCustomContextMenu'));
  const [useCustomMenu, setUseCustomMenu] = useState(getStoredPreference());
  const { data: profile, isLoading } = useProfile(userId);

  const handleContextMenuPreference = (enabled: boolean) => {
    setUseCustomMenu(enabled);
    localStorage.setItem('useCustomContextMenu', String(enabled));
  };

  if (isLoading) {
    return <Skeleton className="w-full h-full" />;
  }

  if (!isEnabled) {
    return <>{children}</>;
  }

  const handleRightClick = (e: React.MouseEvent) => {
    if (!useCustomMenu) {
      return;
    }
    e.preventDefault();
  };

  return (
    <>
      {useCustomMenu ? (
        <ContextMenu>
          <ContextMenuTrigger asChild onContextMenu={handleRightClick}>
            {children}
          </ContextMenuTrigger>
          <ContextMenuContent className="bg-[#403E43] border-[#33C3F0]/20 text-white">
            <ContextMenuItem 
              className="hover:bg-[#33C3F0]/10 focus:bg-[#33C3F0]/10 cursor-pointer"
              onClick={() => setIsProfileOpen(true)}
            >
              View Profile
            </ContextMenuItem>
            <ContextMenuItem
              className="hover:bg-[#33C3F0]/10 focus:bg-[#33C3F0]/10 cursor-pointer"
              onClick={() => setShowPreferenceDialog(true)}
            >
              Context Menu Settings
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ) : (
        <div onContextMenu={(e) => {
          // Allow default context menu
          if (e.altKey) {
            e.preventDefault();
            setShowPreferenceDialog(true);
          }
        }}>
          {children}
        </div>
      )}
      
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent>
          <DialogTitle>User Profile</DialogTitle>
          <ProfileView userId={userId} />
        </DialogContent>
      </Dialog>

      <Dialog open={showPreferenceDialog} onOpenChange={setShowPreferenceDialog}>
        <DialogContent>
          <DialogTitle>Context Menu Preference</DialogTitle>
          <DialogDescription>
            Would you like to use our custom context menu when right-clicking on users?
            {!useCustomMenu && (
              <div className="mt-2 text-sm text-muted-foreground">
                Tip: Hold Alt + Right Click to show this dialog again
              </div>
            )}
          </DialogDescription>
          <div className="flex items-center space-x-2 mt-4">
            <Switch
              checked={useCustomMenu}
              onCheckedChange={handleContextMenuPreference}
            />
            <span>Enable custom context menu</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
