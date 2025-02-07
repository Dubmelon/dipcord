
import { useQuery } from "@tanstack/react-query";
import { Server } from "./types";

// Mock data for development
const mockServers: Server[] = [
  {
    id: "1",
    name: "Gaming Hub",
    description: "A place for gamers to hang out",
    avatar_url: null,
    is_private: false,
    member_count: 150,
    owner_id: "1",
    is_member: true,
    currentUserId: "1"
  },
  {
    id: "2",
    name: "Book Club",
    description: "Discuss your favorite books",
    avatar_url: null,
    is_private: true,
    member_count: 45,
    owner_id: "2",
    is_member: false,
    currentUserId: "1"
  },
  {
    id: "3",
    name: "Music Production",
    description: "Share and create music together",
    avatar_url: null,
    is_private: false,
    member_count: 89,
    owner_id: "1",
    is_member: true,
    currentUserId: "1"
  }
];

export const useServers = () => {
  return useQuery({
    queryKey: ['user-servers'],
    queryFn: async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockServers;
    },
    refetchOnWindowFocus: false
  });
};
