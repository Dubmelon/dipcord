
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuth = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);

  const checkAuth = useCallback(async () => {
    console.log("[Feed] Checking authentication status");
    const startTime = performance.now();
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("[Feed] Auth check error:", error);
        toast.error("Authentication error");
        return;
      }

      if (!session) {
        console.log("[Feed] No active session, redirecting to login");
        navigate("/");
        return;
      }

      console.log("[Feed] User authenticated:", session.user.id);
      setCurrentUser(session.user);
      
      const endTime = performance.now();
      console.log(`[Feed] Auth check completed in ${(endTime - startTime).toFixed(2)}ms`);
    } catch (error) {
      console.error("[Feed] Unexpected auth error:", error);
      toast.error("Authentication failed");
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { currentUser };
};
