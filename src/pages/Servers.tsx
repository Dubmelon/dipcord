
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
  is_private: boolean | null;
  member_count: number;
  is_member?: boolean;
}

const Servers = () => {
  const navigate = useNavigate();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (!user) {
        navigate("/");
        throw new Error("Not authenticated");
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
          *,
          member_count:server_members(count),
          members:server_members(user_id)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Failed to load servers");
        throw error;
      }

      return data?.map(server => ({
        ...server,
        member_count: server.member_count?.[0]?.count || 0,
        is_member: server.members?.some(member => member.user_id === currentUser.id) || false
      })) as Server[];
    },
    enabled: !!currentUser,
    staleTime: 1000 * 60,
    retry: 1,
  });

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      navigate("/");
    }
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
