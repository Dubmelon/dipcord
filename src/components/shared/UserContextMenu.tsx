
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
      <div onClick={() => setIsProfileOpen(true)} className="cursor-pointer">
        {children}
      </div>
      
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent>
          <DialogTitle>User Profile</DialogTitle>
          <ProfileView userId={userId} />
        </DialogContent>
      </Dialog>
    </>
  );
};

