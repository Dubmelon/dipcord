
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Users, LogOut } from "lucide-react";
import { toast } from "sonner";

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
  const queryClient = useQueryClient();
  const [newServerName, setNewServerName] = useState("");
  const [newServerDescription, setNewServerDescription] = useState("");

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

      // Get all servers with member count and efficient join
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
    staleTime: 1000 * 60, // Cache for 1 minute
    retry: 1,
  });

  const createServer = useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      if (!currentUser) throw new Error("Not authenticated");

      // First ensure user profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', currentUser.id)
        .single();

      if (!profile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: currentUser.id,
            username: currentUser.email?.split('@')[0] || 'user',
            full_name: currentUser.email
          }]);
        
        if (insertError) throw insertError;
      }

      // Create server
      const { data: server, error: serverError } = await supabase
        .from('servers')
        .insert([{ 
          name,
          description,
          owner_id: currentUser.id 
        }])
        .select()
        .single();

      if (serverError) throw serverError;

      // Add creator as member
      const { error: memberError } = await supabase
        .from('server_members')
        .insert([{
          server_id: server.id,
          user_id: currentUser.id,
          role: 'owner'
        }]);

      if (memberError) throw memberError;

      return server;
    },
    onSuccess: () => {
      setNewServerName("");
      setNewServerDescription("");
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      toast.success("Server created successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Error creating server: ${error.message}`);
    }
  });

  const joinServer = useMutation({
    mutationFn: async (serverId: string) => {
      if (!currentUser) throw new Error("Not authenticated");

      const { data: existingMembership, error: checkError } = await supabase
        .from('server_members')
        .select('id')
        .eq('server_id', serverId)
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existingMembership) {
        throw new Error("You are already a member of this server");
      }

      const { error } = await supabase
        .from('server_members')
        .insert([{ 
          server_id: serverId,
          user_id: currentUser.id,
          role: 'member'
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      toast.success("Joined server successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const handleCreateServer = async () => {
    if (!newServerName.trim() || !newServerDescription.trim()) return;
    await createServer.mutate({ 
      name: newServerName, 
      description: newServerDescription 
    });
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      queryClient.clear();
      navigate("/");
    }
  };

  if (serversError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-red-500">Error loading servers</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['servers'] })}>
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

        <Card className="mb-8 glass-morphism">
          <CardHeader>
            <CardTitle className="text-white">Create a New Server</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Server name"
              value={newServerName}
              onChange={(e) => setNewServerName(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/50"
            />
            <Input
              placeholder="Server description"
              value={newServerDescription}
              onChange={(e) => setNewServerDescription(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/50"
            />
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleCreateServer} 
              disabled={!newServerName.trim() || !newServerDescription.trim() || createServer.isPending}
              className="hover-scale w-full"
            >
              {createServer.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Create Server
            </Button>
          </CardFooter>
        </Card>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="glass-morphism animate-pulse">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-white/10" />
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-white/10 rounded" />
                      <div className="h-3 w-32 bg-white/10 rounded" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 w-16 bg-white/10 rounded" />
                </CardContent>
                <CardFooter>
                  <div className="h-9 w-full bg-white/10 rounded" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {servers?.map((server) => (
              <Card key={server.id} className="glass-morphism hover-scale">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={server.avatar_url ?? undefined} />
                      <AvatarFallback className="bg-white/10 text-white">
                        {server.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg text-white">
                        <Link to={`/servers/${server.id}`} className="hover:underline">
                          {server.name}
                        </Link>
                      </CardTitle>
                      <p className="text-sm text-white/60">{server.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-white/60">
                    <Users className="h-4 w-4 mr-1" />
                    {server.member_count} members
                  </div>
                </CardContent>
                <CardFooter>
                  {server.is_member ? (
                    <Link to={`/servers/${server.id}`} className="w-full">
                      <Button className="w-full" variant="outline">
                        View Server
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      className="w-full hover:bg-white/10" 
                      variant="outline"
                      onClick={() => joinServer.mutate(server.id)}
                      disabled={joinServer.isPending}
                    >
                      {joinServer.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        "Join Server"
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Servers;
