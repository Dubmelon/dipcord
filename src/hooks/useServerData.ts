
import { useQuery } from "@tanstack/react-query";

const mockServerData = {
  id: "1",
  name: "Gaming Hub",
  description: "A place for gamers to hang out",
  avatar_url: null,
  owner: {
    username: "JohnDoe"
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
      
      const endTime = performance.now();
      console.log(`[ServerView] Server fetch completed in ${(endTime - startTime).toFixed(2)}ms:`, mockServerData);
      return mockServerData;
    },
    enabled: !!serverId,
    staleTime: 30000,
    meta: {
      errorMessage: "Failed to load server details"
    }
  });
};
