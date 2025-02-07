
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
      const membershipStart = performance.now();
      console.log("[ServerGrid] Fetching server memberships...");
      const { data: memberships, error: membershipError } = await supabase
        .from('server_members')
        .select(`
          server:servers (
            id,
            name,
            description,
            avatar_url
          )
        `)
        .eq('user_id', user.id);

      if (membershipError) {
        console.error("[ServerGrid] Server membership fetch error:", membershipError);
        throw new Error(`Failed to fetch server memberships: ${membershipError.message}`);
      }

      const membershipEnd = performance.now();
      console.log(`[ServerGrid] Server memberships fetch took ${membershipEnd - membershipStart}ms`);
      console.log("[ServerGrid] Server memberships fetched:", memberships);
      
      const validServers = memberships
        .filter(item => item.server)
        .map(item => item.server as Server);
      
      const endTime = performance.now();
      console.log(`[ServerGrid] Total operation took ${endTime - startTime}ms`);
      console.log("[ServerGrid] Processed valid servers:", validServers);
      
      return validServers;
    },
    retry: 1,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "Failed to load servers"
    }
  });
};
