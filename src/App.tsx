
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { ThemeProvider } from "./hooks/use-theme";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Feed from "./pages/Feed";
import Servers from "./pages/Servers";
import ServerView from "./pages/ServerView";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";

// Configure React Query with logging
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      onError: (error) => {
        console.error('[Query Error]:', error);
      }
    },
    mutations: {
      onError: (error) => {
        console.error('[Mutation Error]:', error);
      }
    }
  }
});

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    console.log('[App] Initializing authentication state');
    
    // Handle auth state changes and online status
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[Auth] Event: ${event}`, session?.user?.id);
      const isAuthed = !!session;
      setIsAuthenticated(isAuthed);

      // Update online status based on auth state
      if (session?.user) {
        if (event === 'SIGNED_IN') {
          console.log('[Auth] Updating user online status to true');
          try {
            await supabase
              .from('profiles')
              .update({ is_online: true })
              .eq('id', session.user.id);
          } catch (error) {
            console.error('[Auth] Failed to update online status:', error);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('[Auth] Updating user online status to false');
          try {
            await supabase
              .from('profiles')
              .update({ is_online: false })
              .eq('id', session.user.id);
          } catch (error) {
            console.error('[Auth] Failed to update offline status:', error);
          }
        }
      }
    });

    // Check initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('[App] Initial session check:', session?.user?.id);
      setIsAuthenticated(!!session);
      if (session?.user) {
        try {
          await supabase
            .from('profiles')
            .update({ is_online: true })
            .eq('id', session.user.id);
          console.log('[App] Updated initial online status');
        } catch (error) {
          console.error('[App] Failed to update initial online status:', error);
        }
      }
    });

    // Set up beforeunload handler to mark user as offline when leaving
    const handleBeforeUnload = async () => {
      console.log('[App] Handling page unload');
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          await supabase
            .from('profiles')
            .update({ is_online: false })
            .eq('id', session.user.id);
          console.log('[App] Updated offline status before unload');
        } catch (error) {
          console.error('[App] Failed to update offline status before unload:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Performance monitoring
    const routeChangeStart = performance.now();
    console.log('[Performance] Initial route render start');

    // Cleanup
    return () => {
      subscription?.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      const routeChangeEnd = performance.now();
      console.log(`[Performance] Route render time: ${routeChangeEnd - routeChangeStart}ms`);
    };
  }, []);

  // Show nothing while checking authentication
  if (isAuthenticated === null) {
    console.log('[App] Authentication state still loading');
    return null;
  }

  console.log('[App] Rendering with auth state:', isAuthenticated);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="app-theme">
        <TooltipProvider>
          <div className="relative min-h-screen font-sans bg-[#403E43]">
            <div className="relative z-10">
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <div className="pb-16">
                  <Routes>
                    <Route 
                      path="/" 
                      element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Index />} 
                    />
                    <Route 
                      path="/dashboard" 
                      element={isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />} 
                    />
                    <Route 
                      path="/feed" 
                      element={isAuthenticated ? <Feed /> : <Navigate to="/" replace />} 
                    />
                    <Route 
                      path="/servers" 
                      element={isAuthenticated ? <Servers /> : <Navigate to="/" replace />} 
                    />
                    <Route 
                      path="/servers/:serverId" 
                      element={isAuthenticated ? <ServerView /> : <Navigate to="/" replace />} 
                    />
                    <Route 
                      path="/messages" 
                      element={isAuthenticated ? <Messages /> : <Navigate to="/" replace />} 
                    />
                    <Route 
                      path="/settings" 
                      element={isAuthenticated ? <Settings /> : <Navigate to="/" replace />} 
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  {isAuthenticated && <Navigation />}
                </div>
              </BrowserRouter>
            </div>
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
