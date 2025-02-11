
import { Card } from "@/components/ui/card";
import { ServerCard } from "./ServerCard";
import { ServerFolder } from "./ServerFolder";
import { useServerFolders } from "@/hooks/useServerFolders";
import { Server } from "@/components/dashboard/types";

interface ServerListProps {
  servers: Server[];
  currentUserId: string;
  isLoading: boolean;
}

export const ServerList = ({ servers, currentUserId, isLoading }: ServerListProps) => {
  const { folders, loadingFolders } = useServerFolders(currentUserId);

  if (isLoading || loadingFolders) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="glass-morphism animate-pulse">
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-white/10" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-white/10 rounded" />
                  <div className="h-3 w-32 bg-white/10 rounded" />
                </div>
              </div>
            </div>
            <div className="px-6 py-2">
              <div className="h-4 w-16 bg-white/10 rounded" />
            </div>
            <div className="p-6 pt-2">
              <div className="h-9 w-full bg-white/10 rounded" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Get servers that aren't in any folder
  const unfolderedServers = servers.filter(server => 
    !folders?.some(folder => 
      folder.memberships.some(membership => membership.server_id === server.id)
    )
  );

  return (
    <div className="space-y-6">
      {folders?.map((folder) => (
        <ServerFolder 
          key={folder.id}
          folder={folder}
          servers={servers}
          currentUserId={currentUserId}
        />
      ))}
      
      {unfolderedServers.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {unfolderedServers.map((server) => (
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
