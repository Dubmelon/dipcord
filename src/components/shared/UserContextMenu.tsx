
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { ProfileView } from "@/components/profile/ProfileView";
import { useProfile } from "@/hooks/useProfile";
import { Skeleton } from "@/components/ui/skeleton";

interface UserContextMenuProps {
  userId: string;
  children: React.ReactNode;
  isEnabled?: boolean;
}

export const UserContextMenu = ({ userId, children, isEnabled = true }: UserContextMenuProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { data: profile, isLoading } = useProfile(userId);

  if (isLoading) {
    return <Skeleton className="w-full h-full" />;
  }

  if (!isEnabled) {
    return <>{children}</>;
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent className="bg-[#403E43] border-[#33C3F0]/20 text-white">
          <ContextMenuItem 
            className="hover:bg-[#33C3F0]/10 focus:bg-[#33C3F0]/10 cursor-pointer"
            onClick={() => setIsProfileOpen(true)}
          >
            View Profile
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent>
          <DialogTitle>User Profile</DialogTitle>
          <ProfileView userId={userId} />
        </DialogContent>
      </Dialog>
    </>
  );
};
