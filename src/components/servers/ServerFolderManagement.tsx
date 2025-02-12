
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useServerFolders } from '@/hooks/useServerFolders';

interface ServerFolderManagementProps {
  userId: string;
}

export const ServerFolderManagement = ({ userId }: ServerFolderManagementProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const { folders, createFolder } = useServerFolders(userId);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    await createFolder.mutateAsync({
      name: newFolderName.trim()
    });

    setNewFolderName('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Folder
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Server Folder</DialogTitle>
          <DialogDescription>
            Create a new folder to organize your servers
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="folderName">Folder Name</Label>
            <Input
              id="folderName"
              placeholder="Enter folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateFolder}
            disabled={!newFolderName.trim() || createFolder.isPending}
          >
            {createFolder.isPending ? 'Creating...' : 'Create Folder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
