
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "@/components/ui/context-menu";
import { Edit, Trash, Palette } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useServerFolders } from "@/hooks/useServerFolders";
import { toast } from "sonner";

interface FolderContextMenuProps {
  children: React.ReactNode;
  folderId: string;
  folderName: string;
  userId: string;
}

const FOLDER_COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Default', value: null },
];

export const FolderContextMenu = ({ children, folderId, folderName, userId }: FolderContextMenuProps) => {
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newName, setNewName] = useState(folderName);
  const { updateFolder, deleteFolder } = useServerFolders(userId);

  const handleRename = async () => {
    try {
      await updateFolder.mutateAsync({
        id: folderId,
        name: newName
      });
      setIsRenameOpen(false);
      toast.success("Folder renamed successfully");
    } catch (error) {
      toast.error("Failed to rename folder");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteFolder.mutateAsync(folderId);
      setIsDeleteOpen(false);
      toast.success("Folder deleted successfully");
    } catch (error) {
      toast.error("Failed to delete folder");
    }
  };

  const handleColorChange = async (color: string | null) => {
    try {
      await updateFolder.mutateAsync({
        id: folderId,
        color
      });
      toast.success("Folder color updated");
    } catch (error) {
      toast.error("Failed to update folder color");
    }
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
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Palette className="h-4 w-4 mr-2" />
              Change Color
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              {FOLDER_COLORS.map((color) => (
                <ContextMenuItem 
                  key={color.name}
                  onClick={() => handleColorChange(color.value)}
                >
                  <div className="flex items-center">
                    {color.value ? (
                      <div 
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: color.value }}
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full mr-2 bg-primary/10" />
                    )}
                    {color.name}
                  </div>
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuItem 
            onClick={() => setIsDeleteOpen(true)} 
            className="text-red-600"
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete Folder
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
            <DialogDescription>
              Enter a new name for your folder
            </DialogDescription>
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

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this folder? All servers will be moved back to the main list.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteFolder.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
