
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Server } from "@/types/database";
import { ServerOverviewTab } from "./ServerOverviewTab";
import { ServerModerationTab } from "./ServerModerationTab";

interface ServerSettingsProps {
  server: Server;
}

export const ServerSettings = ({ server }: ServerSettingsProps) => {
  return (
    <div className="container max-w-2xl py-8">
      <Tabs defaultValue="overview" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <ServerOverviewTab server={server} />
        </TabsContent>

        <TabsContent value="moderation">
          <ServerModerationTab server={server} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

