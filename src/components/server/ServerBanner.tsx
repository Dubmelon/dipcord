
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
      className="relative w-full h-32 md:h-48 overflow-hidden"
    >
      {url ? (
        <img
          src={url}
          alt={`${serverName} banner`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-primary/20 to-primary/10" />
      )}
    </motion.div>
  );
};
