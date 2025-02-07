
import { useQuery } from "@tanstack/react-query";

interface ServerData {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  owner: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  member_count: number;
  created_at: string;
  updated_at: string;
}

const mockServerData: Record<string, ServerData> = {
  "1": {
    id: "1",
    name: "Gaming Hub",
    description: "A place for gamers to hang out and discuss their favorite games",
    avatar_url: null,
    owner: {
      id: "1",
      username: "JohnDoe",
      avatar_url: null
    },
    member_count: 150,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  "2": {
    id: "2",
    name: "Book Club",
    description: "Discuss your favorite books with fellow readers",
    avatar_url: null,
    owner: {
      id: "2",
      username: "BookLover",
      avatar_url: null
    },
    member_count: 45,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
};

export const useServerData = (serverId: string | undefined) => {
  return useQuery({
    queryKey: ['server', serverId],
    queryFn: async () => {
      console.log(`[ServerView] Fetching server details for ID: ${serverId}`);
      const startTime = performance.now();

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const server = mockServerData[serverId || ""];
      if (!server) {
        throw new Error("Server not found");
      }

      const endTime = performance.now();
      console.log(`[ServerView] Server fetch completed in ${(endTime - startTime).toFixed(2)}ms:`, server);
      return server;
    },
    enabled: !!serverId,
    staleTime: 30000,
    meta: {
      errorMessage: "Failed to load server details"
    }
  });
};
