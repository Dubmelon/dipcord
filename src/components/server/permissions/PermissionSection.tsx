
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Shield } from "lucide-react";
import type { Permission } from "@/types/permissions";

interface PermissionSectionProps {
  permissions: Permission[];
  selectedPermissions: Record<string, boolean>;
  onTogglePermission: (permissionId: string, value: boolean) => void;
  isDisabled?: boolean;
}

export const PermissionSection = ({
  permissions,
  selectedPermissions,
  onTogglePermission,
  isDisabled
}: PermissionSectionProps) => {
  return (
    <div className="space-y-4">
      {permissions.map((permission) => (
        <div
          key={String(permission.id)}
          className="flex items-start justify-between space-x-4"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Label className="font-medium cursor-help">
                {permission.label}
              </Label>
              {permission.recommendedForModerators && (
                <Badge variant="secondary" className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Recommended for mods
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {permission.description}
            </p>
          </div>
          <Switch
            checked={selectedPermissions[String(permission.id)] || false}
            onCheckedChange={(checked) => onTogglePermission(String(permission.id), checked)}
            disabled={isDisabled}
          />
        </div>
      ))}
    </div>
  );
};
