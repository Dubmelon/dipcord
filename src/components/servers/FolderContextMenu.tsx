
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Edit, Trash, Palette } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useServerFolders } from "@/hooks/useServerFolders";

interface FolderContextMenuProps {
  children: React.ReactNode;
  folderId: string;
  folderName: string;
}

export const FolderContextMenu = ({ children, folderId, folderName }: FolderContextMenuProps) => {
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [newName, setNewName] = useState(folderName);
  const { updateFolder, deleteFolder } = useServerFolders();

  const handleRename = async () => {
    await updateFolder.mutateAsync({
      id: folderId,
      name: newName
    });
    setIsRenameOpen(false);
  };

  const handleDelete = async () => {
    await deleteFolder.mutateAsync(folderId);
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => setIsRenameOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Rename Folder
          </ContextMenuItem>
          <ContextMenuItem onClick={handleDelete} className="text-red-600">
            <Trash className="h-4 w-4 mr-2" />
            Delete Folder
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">New Folder Name</Label>
              <Input
                id="folderName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter new folder name"
              />
            </div>
            <Button
              onClick={handleRename}
              disabled={!newName.trim() || updateFolder.isPending}
              className="w-full"
            >
              {updateFolder.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
