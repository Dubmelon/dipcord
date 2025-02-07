
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const PostSkeleton = () => {
  return (
    <Card className="p-4 bg-card shadow-lg space-y-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-4 pt-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>
    </Card>
  );
};
