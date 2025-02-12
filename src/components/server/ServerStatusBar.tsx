
import { motion } from "framer-motion";
import type { Server } from "@/types/database";
import { format } from "date-fns";

interface ServerStatusBarProps {
  server: Server;
}

export const ServerStatusBar = ({ server }: ServerStatusBarProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2 flex items-center gap-4 text-sm text-muted-foreground bg-accent/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-border/50"
    >
      <motion.span 
        className="flex items-center gap-2 hover:text-primary transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.span 
          className="w-2 h-2 rounded-full bg-green-500"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1] 
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <span className="font-medium">Online</span>
      </motion.span>
      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors">
        Created {format(new Date(server.created_at), "MMM d, yyyy")}
      </span>
    </motion.div>
  );
};
