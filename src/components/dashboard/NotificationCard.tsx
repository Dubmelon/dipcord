
import { Bell } from "lucide-react";
import { motion } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NotificationPopover } from "@/components/notifications/NotificationPopover";
import { item } from "./animations";

export const NotificationCard = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <motion.div
          variants={item}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group relative bg-card hover:bg-accent/10 transition-all duration-200 rounded-lg shadow-sm cursor-pointer p-6"
        >
          <Bell className="h-5 w-5 mb-4 text-foreground" />
          <h3 className="text-xl font-semibold mb-2 text-foreground">Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Check your latest notifications and updates
          </p>
        </motion.div>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <NotificationPopover />
      </PopoverContent>
    </Popover>
  );
};
