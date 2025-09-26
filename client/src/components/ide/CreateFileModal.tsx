
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, X } from 'lucide-react';

interface CreateFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFile: (name: string) => Promise<void>;
  title?: string;
  placeholder?: string;
}

export function CreateFileModal({
  isOpen,
  onClose,
  onCreateFile,
  title = "Create New File",
  placeholder = "Enter file name..."
}: CreateFileModalProps) {
  const [fileName, setFileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    setIsCreating(true);
    try {
      await onCreateFile(fileName.trim());
      setFileName('');
      onClose();
    } catch (error) {
      console.error('Failed to create file:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setFileName('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fileName">File Name</Label>
            <Input
              id="fileName"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder={placeholder}
              autoFocus
              disabled={isCreating}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!fileName.trim() || isCreating}
            >
              {isCreating ? 'Creating...' : 'Create File'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
