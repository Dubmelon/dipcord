
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { CreateServerForm } from "@/components/servers/CreateServerForm";
import { ServerList } from "@/components/servers/ServerList";
import { supabase } from "@/integrations/supabase/client";

interface Server {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  icon_url: string | null;
  banner_url: string | null;
  owner_id: string;
  updated_at: string;
  is_private: boolean;
  member_count: number;
  is_member?: boolean;
}

const Servers = () => {
  const navigate = useNavigate();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        throw error;
      }
      
      return user;
    },
  });

  const { data: servers, isLoading, error: serversError } = useQuery({
    queryKey: ['servers'],
    queryFn: async () => {
      if (!currentUser) return [];

      const { data, error } = await supabase
        .from('servers')
        .select(`
          id,
          name,
          description,
          created_at,
          icon_url,
          banner_url,
          owner_id,
          updated_at,
          is_private,
          member_count
        `)
        .order('name');

      if (error) {
        throw error;
      }

      return data as Server[];
    },
    enabled: !!currentUser,
    staleTime: 1000 * 60,
    retry: 1,
  });

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
      return;
    }
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
