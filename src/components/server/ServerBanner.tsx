
import { motion } from "framer-motion";

interface ServerBannerProps {
  url: string | null;
  serverName: string;
}

export const ServerBanner = ({ url, serverName }: ServerBannerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative w-full h-32 md:h-48 overflow-hidden px-4 md:px-8 lg:px-12"
    >
      {url ? (
        <img
          src={url}
          alt={`${serverName} banner`}
          className="w-full h-full object-cover rounded-md"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-primary/20 to-primary/10 rounded-md" />
      )}
    </motion.div>
  );
};

