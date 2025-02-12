
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
      <div 
        onClick={() => setIsProfileOpen(true)} 
        className="cursor-pointer hover:opacity-80 transition-opacity"
      >
        {children}
      </div>
      
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="p-0 border-none bg-transparent max-w-[300px]">
          <ProfileView userId={userId} onClose={() => setIsProfileOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};
