
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      meta: {
        errorMessage: 'Failed to fetch data'
      }
    }
  }
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('[ProtectedRoute] Checking authentication status');
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[ProtectedRoute] Initial session check:', session?.user?.id);
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[ProtectedRoute] Auth state changed: ${event}`, session?.user?.id);
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  useEffect(() => {
    console.log('[App] Initializing');
    
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

    supabase.auth.getSession().then(async ({ data: { session } }) => {
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

    const routeChangeStart = performance.now();
    console.log('[Performance] Initial route render start');

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      const routeChangeEnd = performance.now();
      console.log(`[Performance] Route render time: ${routeChangeEnd - routeChangeStart}ms`);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="app-theme">
        <TooltipProvider>
          <div className="flex flex-col min-h-screen font-sans bg-background">
            <BrowserRouter>
              <Navigation />
              <main className="flex-1 relative pt-16">
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/feed" 
                    element={
                      <ProtectedRoute>
                        <Feed />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/servers" 
                    element={
                      <ProtectedRoute>
                        <Servers />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/servers/:serverId/*" 
                    element={
                      <ProtectedRoute>
                        <ServerView />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/messages" 
                    element={
                      <ProtectedRoute>
                        <Messages />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
