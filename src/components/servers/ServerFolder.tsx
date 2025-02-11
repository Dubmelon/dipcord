
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, BellOff } from "lucide-react";
import { ServerCard } from "./ServerCard";
import type { Server } from "@/components/dashboard/types";
import type { ServerFolder as ServerFolderType } from "@/types/folders";

interface ServerFolderProps {
  folder: ServerFolderType & { memberships: Array<{ server_id: string }> };
  servers: Server[];
  currentUserId: string;
}

export const ServerFolder = ({ folder, servers, currentUserId }: ServerFolderProps) => {
  const [isExpanded, setIsExpanded] = useState(folder.is_expanded);

  const folderServers = servers.filter(server => 
    folder.memberships.some(membership => membership.server_id === server.id)
  );

  if (folderServers.length === 0) return null;

  return (
    <div className="space-y-2">
      <Button
        variant="ghost"
        className="w-full flex items-center justify-between p-2 hover:bg-accent/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <span className="font-medium" style={folder.color ? { color: folder.color } : undefined}>
            {folder.name}
          </span>
        </div>
        {folder.is_muted && (
          <BellOff className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
      
      {isExpanded && (
        <div className="grid gap-4 md:grid-cols-2 pl-4">
          {folderServers.map((server) => (
            <ServerCard 
              key={server.id} 
              server={server} 
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
