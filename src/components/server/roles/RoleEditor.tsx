
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, RefreshCw } from "lucide-react";
import { PermissionSection } from "../permissions/PermissionSection";
import { PERMISSIONS, PERMISSION_CATEGORIES } from "@/types/permissions";
import { ChannelPermissionOverrides } from "./ChannelPermissionOverrides";
import { toast } from "sonner";
import type { Role } from "@/types/database";

interface RoleEditorProps {
  role: Role;
  serverId: string;
  onUpdateRole: (updates: Partial<Role>) => void;
  onDeleteRole: () => void;
  onIconUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  predefinedColors: string[];
  isDeleting: boolean;
}

export const RoleEditor = ({
  role,
  serverId,
  onUpdateRole,
  onDeleteRole,
  onIconUpload,
  predefinedColors,
  isDeleting
}: RoleEditorProps) => {
  const groupedPermissions = PERMISSIONS.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, typeof PERMISSIONS>);

  const handleColorChange = (color: string) => {
    // Validate hex color
    const isValidHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
    if (!isValidHex && color !== '') {
      toast.error('Please enter a valid hex color (e.g., #FF0000)');
      return;
    }
    onUpdateRole({ color });
  };

  const generateRandomColor = () => {
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    onUpdateRole({ color: randomColor });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Input
          value={role.name}
          onChange={(e) => onUpdateRole({ name: e.target.value })}
          className="max-w-xs"
          placeholder="Role name"
        />
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <label className="text-sm font-medium">Role Color</label>
            <div className="flex items-center gap-2">
              <div className="flex flex-wrap gap-2 max-w-[200px]">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded-full border border-border hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: color }}
                    onClick={() => onUpdateRole({ color })}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={role.color || ''}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-24"
                  placeholder="#HEX"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={generateRandomColor}
                  title="Generate random color"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <label className="text-sm font-medium">Role Icon</label>
            <div className="flex items-center gap-2">
              {role.icon && (
                <img
                  src={role.icon}
                  alt="Role icon"
                  className="w-8 h-8 rounded-full"
                />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('icon-upload')?.click()}
              >
                Upload Icon
              </Button>
              <input
                id="icon-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={onIconUpload}
              />
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDeleteRole}
            disabled={isDeleting || role.is_system}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Role
          </Button>
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="permissions" className="w-full">
        <TabsList>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="channel-overrides">Channel Overrides</TabsTrigger>
        </TabsList>

        <TabsContent value="permissions" className="space-y-6">
          {Object.entries(PERMISSION_CATEGORIES).map(([category, label]) => (
            <div key={category} className="space-y-4">
              <h3 className="font-semibold">{label}</h3>
              <PermissionSection
                permissions={groupedPermissions[category] || []}
                selectedPermissions={role.permissions_v2}
                onTogglePermission={(permissionId, value) => {
                  const newPermissions = {
                    ...role.permissions_v2,
                    [permissionId]: value
                  };
                  onUpdateRole({ permissions_v2: newPermissions });
                }}
                isDisabled={role.is_system}
              />
            </div>
          ))}
        </TabsContent>

        <TabsContent value="channel-overrides">
          <ChannelPermissionOverrides 
            serverId={serverId}
            role={role}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
