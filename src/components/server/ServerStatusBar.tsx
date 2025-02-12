
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
      className="mt-2 flex items-center gap-4 text-sm text-muted-foreground"
    >
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        Online
      </span>
      <span>Created {format(new Date(server.created_at), "MMM d, yyyy")}</span>
    </motion.div>
  );
};
