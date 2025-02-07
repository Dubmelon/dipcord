
import { motion } from "framer-motion";
import { Server } from "./types";
import { item } from "./animations";

interface ServerCardProps {
  server: Server;
  onClick: (serverId: string) => void;
}

export const ServerCard = ({ server, onClick }: ServerCardProps) => {
  return (
    <motion.button
      variants={item}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(server.id)}
      className="group relative flex flex-col p-6 rounded-lg bg-card hover:bg-accent/10 transition-all duration-200 text-left"
    >
      <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
        {server.name}
      </h3>
      {server.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {server.description}
        </p>
      )}
    </motion.button>
  );
};
