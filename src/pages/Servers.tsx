
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { CreateServerForm } from "@/components/servers/CreateServerForm";
import { ServerList } from "@/components/servers/ServerList";

interface Server {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  avatar_url: string | null;
  owner_id: string | null;
  updated_at: string;
  is_private: boolean;
  member_count: number;
  is_member?: boolean;
}

const mockUser = {
  id: "1",
  email: "demo@example.com"
};

const Servers = () => {
  const navigate = useNavigate();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockUser;
    },
  });

  const { data: servers, isLoading, error: serversError } = useQuery({
    queryKey: ['servers'],
    queryFn: async () => {
      if (!currentUser) return [];

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Return mock data
      return [
        {
          id: "1",
          name: "Gaming Hub",
          description: "A place for gamers to hang out",
          created_at: new Date().toISOString(),
          avatar_url: null,
          owner_id: currentUser.id,
          updated_at: new Date().toISOString(),
          is_private: false,
          member_count: 150,
          is_member: true
        },
        {
          id: "2",
          name: "Book Club",
          description: "Discuss your favorite books",
          created_at: new Date().toISOString(),
          avatar_url: null,
          owner_id: "2",
          updated_at: new Date().toISOString(),
          is_private: true,
          member_count: 45,
          is_member: false
        }
      ] as Server[];
    },
    enabled: !!currentUser,
    staleTime: 1000 * 60,
    retry: 1,
  });

  const handleSignOut = () => {
    navigate("/");
    toast.success("Signed out successfully");
  };

  if (serversError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-red-500">Error loading servers</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto max-w-3xl p-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Servers</h1>
          <Button variant="ghost" onClick={handleSignOut} className="hover:bg-white/10">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {currentUser && (
          <CreateServerForm currentUserId={currentUser.id} />
        )}

        <ServerList 
          servers={servers || []} 
          currentUserId={currentUser?.id || ''} 
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Servers;
