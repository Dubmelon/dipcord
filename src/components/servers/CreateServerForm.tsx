
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock server creation
      return {
        id: Math.random().toString(),
        name,
        description,
        owner_id: currentUserId,
        is_private: false,
        member_count: 1,
        avatar_url: null
      };
    },
    onSuccess: () => {
      setNewServerName("");
      setNewServerDescription("");
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      toast.success("Server created successfully!");
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

  return (
    <Card className="mb-8 glass-morphism">
      <CardHeader>
        <CardTitle className="text-white">Create a New Server</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Server name (3-50 characters)"
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
          disabled={
            !newServerName.trim() || 
            !newServerDescription.trim() || 
            createServer.isPending ||
            newServerName.length < 3 ||
            newServerName.length > 50
          }
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
