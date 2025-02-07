
import { useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@/components/Auth";

const IndexPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/dashboard");
      }
    });

    // Check if user is already signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-6 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome to SocialApp</h1>
          <p className="text-muted-foreground mt-2">Connect with friends and share your moments</p>
        </div>
        <Auth />
      </div>
    </div>
  );
};

export default memo(IndexPage);
