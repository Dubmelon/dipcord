import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

type Notification = {
  id: string;
  title: string;
  content: string;
  type: string;
  created_at: string;
  is_read: boolean;
};

export function NotificationPopover() {
  const [unreadCount, setUnreadCount] = useState(0);

  const { data: notifications, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Notification[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  useEffect(() => {
    if (notifications) {
      setUnreadCount(notifications.filter((n) => !n.is_read).length);
    }
  }, [notifications]);

  const markAsRead = async (id: string) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
    refetch();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium leading-none">Notifications</h4>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </div>
      <ScrollArea className="h-80">
        <div className="space-y-4">
          {notifications?.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No notifications yet
            </p>
          ) : (
            notifications?.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg transition-colors ${
                  notification.is_read
                    ? "bg-muted/50"
                    : "bg-muted cursor-pointer"
                }`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {notification.content}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}