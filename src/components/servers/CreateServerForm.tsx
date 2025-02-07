
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateServerFormProps {
  currentUserId: string;
}

export const CreateServerForm = ({ currentUserId }: CreateServerFormProps) => {
  const queryClient = useQueryClient();
  const [newServerName, setNewServerName] = useState("");
  const [newServerDescription, setNewServerDescription] = useState("");

  const createServer = useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      // First ensure user profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', currentUserId)
        .single();

      if (!profile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: currentUserId,
            username: 'user',
            full_name: 'User'
          }]);
        
        if (insertError) throw insertError;
      }

      // Create server
      const { data: server, error: serverError } = await supabase
        .from('servers')
        .insert([{ 
          name,
          description,
          owner_id: currentUserId 
        }])
        .select()
        .single();

      if (serverError) throw serverError;

      // Add creator as member
      const { error: memberError } = await supabase
        .from('server_members')
        .insert([{
          server_id: server.id,
          user_id: currentUserId,
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

  const handleCreateServer = async () => {
    if (!newServerName.trim() || !newServerDescription.trim()) return;
    await createServer.mutate({ 
      name: newServerName, 
      description: newServerDescription 
    });
  };

  return (
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
  );
};
