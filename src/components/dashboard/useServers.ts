
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Server } from "./types";
import { toast } from "sonner";

export const useServers = () => {
  const navigate = useNavigate();

  return useQuery({
    queryKey: ['user-servers'],
    queryFn: async () => {
      const startTime = performance.now();
      console.log("[ServerGrid] Starting server fetch process...");
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("[ServerGrid] Authentication error:", authError);
        throw new Error(`Authentication failed: ${authError.message}`);
      }
      
      if (!user) {
        console.log("[ServerGrid] No authenticated user found");
        navigate("/");
        throw new Error("Not authenticated");
      }

      console.log("[ServerGrid] Authenticated user ID:", user.id);

      // Profile check/creation with timing
      const profileStart = performance.now();
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error("[ServerGrid] Profile fetch error:", profileError);
        throw new Error(`Failed to fetch profile: ${profileError.message}`);
      }

      if (!profile) {
        console.log("[ServerGrid] Creating profile for user...");
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert([{ 
            id: user.id,
            username: user.email?.split('@')[0] || 'user',
            is_online: true
          }]);

        if (createProfileError) {
          console.error("[ServerGrid] Profile creation error:", createProfileError);
          throw new Error(`Failed to create profile: ${createProfileError.message}`);
        }
      }
      const profileEnd = performance.now();
      console.log(`[ServerGrid] Profile operation took ${profileEnd - profileStart}ms`);

      // Server memberships fetch with timing
      const serverStart = performance.now();
      console.log("[ServerGrid] Fetching servers...");
      
      // First get server IDs
      const { data: memberships, error: membershipError } = await supabase
        .from('server_members')
        .select('server_id')
        .eq('user_id', user.id);

      if (membershipError) {
        console.error("[ServerGrid] Server memberships fetch error:", membershipError);
        throw new Error(`Failed to fetch server memberships: ${membershipError.message}`);
      }

      const serverIds = memberships.map(m => m.server_id).filter(Boolean);

      // Then fetch the actual servers
      const { data: servers, error: serverError } = await supabase
        .from('servers')
        .select(`
          id,
          name,
          description,
          avatar_url
        `)
        .in('id', serverIds);

      if (serverError) {
        console.error("[ServerGrid] Server fetch error:", serverError);
        throw new Error(`Failed to fetch servers: ${serverError.message}`);
      }

      const serverEnd = performance.now();
      console.log(`[ServerGrid] Server fetch took ${serverEnd - serverStart}ms`);
      console.log("[ServerGrid] Servers fetched:", servers);
      
      const endTime = performance.now();
      console.log(`[ServerGrid] Total operation took ${endTime - startTime}ms`);
      
      return servers || [];
    },
    retry: 1,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Failed to load servers"
    }
  });
};
