import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AnimatedBackground from "./components/AnimatedBackground";
import { Navigation } from "./components/Navigation";
import Index from "./pages/Index";
import Feed from "./pages/Feed";
import Servers from "./pages/Servers";
import ServerView from "./pages/ServerView";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="relative min-h-screen font-sans">
        <AnimatedBackground />
        <div className="relative z-10">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="md:pl-16">
              <Navigation />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/servers" element={<Servers />} />
                <Route path="/servers/:serverId" element={<ServerView />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </div>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;