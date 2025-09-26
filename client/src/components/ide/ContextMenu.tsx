import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Edit3,
  Download,
  Trash2,
  Plus,
  FolderPlus,
  Copy
} from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onRename: () => void;
  onDelete: () => void;
  onDownload?: () => void;
  onCreateFile?: () => void;
  onCreateFolder?: () => void;
  onDuplicate?: () => void;
}

export function ContextMenu({
  x,
  y,
  onClose,
  onRename,
  onDelete,
  onDownload,
  onCreateFile,
  onCreateFolder,
  onDuplicate
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position if menu would go off screen
  const adjustPosition = () => {
    if (!menuRef.current) return { x, y };

    const rect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    if (x + rect.width > viewportWidth) {
      adjustedX = x - rect.width;
    }

    if (y + rect.height > viewportHeight) {
      adjustedY = y - rect.height;
    }

    return { x: adjustedX, y: adjustedY };
  };

  const position = adjustPosition();

  return (
    <div
      ref={menuRef}
      className="fixed bg-popover border border-border rounded-lg shadow-lg py-1 z-50 context-menu min-w-[160px]"
      style={{
        left: position.x,
        top: position.y,
      }}
      data-testid="context-menu"
    >
      {onCreateFile && (
        <Button
          variant="ghost"
          className="w-full justify-start px-3 py-2 text-sm h-auto font-normal"
          onClick={() => {
            onCreateFile();
            onClose();
          }}
          data-testid="context-menu-create-file"
        >
          <Plus size={14} className="mr-2" />
          New File
        </Button>
      )}

      {onCreateFolder && (
        <Button
          variant="ghost"
          className="w-full justify-start px-3 py-2 text-sm h-auto font-normal"
          onClick={() => {
            onCreateFolder();
            onClose();
          }}
          data-testid="context-menu-create-folder"
        >
          <FolderPlus size={14} className="mr-2" />
          New Folder
        </Button>
      )}

      {(onCreateFile || onCreateFolder) && <Separator className="my-1" />}

      <Button
        variant="ghost"
        className="w-full justify-start px-3 py-2 text-sm h-auto font-normal"
        onClick={() => {
          onRename();
          onClose();
        }}
        data-testid="context-menu-rename"
      >
        <Edit3 size={14} className="mr-2" />
        Rename
      </Button>

      <Button
        variant="ghost"
        className="w-full justify-start px-3 py-2 text-sm h-auto font-normal"
        onClick={() => {
          onDuplicate?.();
          onClose();
        }}
        data-testid="context-menu-duplicate"
      >
        <Copy size={14} className="mr-2" />
        Duplicate
      </Button>

      {onDownload && (
        <Button
          variant="ghost"
          className="w-full justify-start px-3 py-2 text-sm h-auto font-normal"
          onClick={() => {
            onDownload();
            onClose();
          }}
          data-testid="context-menu-download"
        >
          <Download size={14} className="mr-2" />
          Download
        </Button>
      )}

      <Separator className="my-1" />

      <Button
        variant="ghost"
        className="w-full justify-start px-3 py-2 text-sm h-auto font-normal text-destructive hover:text-destructive-foreground hover:bg-destructive"
        onClick={() => {
          onDelete();
          onClose();
        }}
        data-testid="context-menu-delete"
      >
        <Trash2 size={14} className="mr-2" />
        Delete
      </Button>
    </div>
  );
}
