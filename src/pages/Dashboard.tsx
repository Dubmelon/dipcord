
import { memo, useEffect } from "react";
import { motion } from "framer-motion";
import { ServerGrid } from "@/components/dashboard/ServerGrid";
import { toast } from "sonner";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const DashboardPage = () => {
  // Add enhanced error handling and logging
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Dashboard Error:", event.error);
      
      // Check if error is related to image loading
      if (event.error instanceof TypeError && event.error.message.includes('Failed to fetch')) {
        console.warn("Image loading error detected");
        toast.error("Failed to load some resources. Please try refreshing the page.");
      }
    };

    window.addEventListener('error', handleError);
    
    // Cleanup
    return () => window.removeEventListener('error', handleError);
  }, []);

  console.log("Dashboard page rendering:", new Date().toISOString());
  
  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={container}
      className="min-h-screen bg-gradient-to-b from-background to-background/80"
    >
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <motion.div variants={item} className="space-y-2">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
              Welcome Back
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Discover and join new communities
            </p>
          </motion.div>
          <motion.div variants={item}>
            <ServerGrid />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default memo(DashboardPage);
