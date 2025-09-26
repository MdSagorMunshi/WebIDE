import { useState, useRef } from 'react';
import { FileItem } from '@/types/ide';
import { FileUtils } from '@/lib/fileUtils';
import { ContextMenu } from './ContextMenu';
import { CreateFileModal } from './CreateFileModal';
import { CreateFolderModal } from './CreateFolderModal';
import {
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  FolderOpen,
  Plus,
  Upload,
  FolderPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface FileTreeProps {
  files: FileItem[];
  selectedFileId: string | null;
  expandedFolders: Set<string>;
  onFileSelect: (fileId: string) => void;
  onFolderToggle: (folderId: string) => void;
  onCreateFile: (name: string, parentId?: string) => Promise<string | undefined>;
  onCreateFolder: (name: string, parentId?: string) => Promise<string | undefined>;
  onDeleteFile: (fileId: string) => void;
  onRenameFile: (fileId: string, newName: string) => void;
  onImportProject: (file: File) => void;
}

interface FileTreeItemProps {
  file: FileItem;
  level: number;
  selectedFileId: string | null;
  expandedFolders: Set<string>;
  onFileSelect: (fileId: string) => void;
  onFolderToggle: (folderId: string) => void;
  onCreateFile: (name: string, parentId?: string) => Promise<string | undefined>;
  onCreateFolder: (name: string, parentId?: string) => Promise<string | undefined>;
  onDeleteFile: (fileId: string) => void;
  onRenameFile: (fileId: string, newName: string) => void;
}

function FileTreeItem({
  file,
  level,
  selectedFileId,
  expandedFolders,
  onFileSelect,
  onFolderToggle,
  onCreateFile,
  onCreateFolder,
  onDeleteFile,
  onRenameFile
}: FileTreeItemProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [showCreateFileModal, setShowCreateFileModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const { toast } = useToast();

  const isExpanded = expandedFolders.has(file.id);
  const isSelected = selectedFileId === file.id;

  const handleClick = () => {
    if (file.type === 'folder') {
      onFolderToggle(file.id);
    } else {
      onFileSelect(file.id);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleRename = () => {
    if (newName.trim() && newName !== file.name) {
      onRenameFile(file.id, newName.trim());
    }
    setIsRenaming(false);
    setNewName(file.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setIsRenaming(false);
      setNewName(file.name);
    }
  };

  const handleCreateFile = async (fileName: string) => {
    const fileId = await onCreateFile(fileName, file.type === 'folder' ? file.id : undefined);
    if (fileId && file.type === 'folder') {
      onFolderToggle(file.id); // Expand folder to show new file
    }
  };

  const handleCreateFolder = async (folderName: string) => {
    const folderId = await onCreateFolder(folderName, file.type === 'folder' ? file.id : undefined);
    if (folderId && file.type === 'folder') {
      onFolderToggle(file.id); // Expand folder to show new folder
    }
  };

  const handleDownload = () => {
    if (file.type === 'file' && file.content !== undefined) {
      FileUtils.downloadFile(file.name, file.content);
      toast({
        title: "File downloaded",
        description: `${file.name} has been downloaded`
      });
    }
  };

  return (
    <>
      <div
        className={`flex items-center py-1 px-2 cursor-pointer rounded text-sm hover:bg-muted/50 ${
          isSelected ? 'bg-accent text-accent-foreground' : ''
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        data-testid={`file-tree-item-${file.name}`}
      >
        {file.type === 'folder' && (
          <div className="w-4 h-4 mr-1 flex items-center justify-center">
            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </div>
        )}
        
        <div className="w-4 h-4 mr-2 flex items-center justify-center">
          {file.type === 'folder' ? (
            isExpanded ? <FolderOpen size={14} className="text-accent" /> : <Folder size={14} className="text-accent" />
          ) : (
            <File size={14} className={FileUtils.getFileIcon(file.name, false).includes('text-') ? FileUtils.getFileIcon(file.name, false).split(' ').pop() : 'text-primary'} />
          )}
        </div>

        {isRenaming ? (
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            className="h-6 text-xs py-0 px-1"
            autoFocus
            data-testid="rename-input"
          />
        ) : (
          <span className="truncate flex-1" data-testid={`file-name-${file.name}`}>
            {file.name}
          </span>
        )}
      </div>

      {file.type === 'folder' && isExpanded && file.children && (
        <div>
          {file.children.map((child) => (
            <FileTreeItem
              key={child.id}
              file={child}
              level={level + 1}
              selectedFileId={selectedFileId}
              expandedFolders={expandedFolders}
              onFileSelect={onFileSelect}
              onFolderToggle={onFolderToggle}
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
              onDeleteFile={onDeleteFile}
              onRenameFile={onRenameFile}
            />
          ))}
        </div>
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onRename={() => {
            setIsRenaming(true);
            setContextMenu(null);
          }}
          onDelete={() => {
            if (confirm(`Are you sure you want to delete ${file.name}?`)) {
              onDeleteFile(file.id);
            }
            setContextMenu(null);
          }}
          onDownload={file.type === 'file' ? handleDownload : undefined}
          onCreateFile={file.type === 'folder' ? (() => {
            setShowCreateFileModal(true);
            setContextMenu(null);
          }) : undefined}
          onCreateFolder={file.type === 'folder' ? (() => {
            setShowCreateFolderModal(true);
            setContextMenu(null);
          }) : undefined}
        />
      )}

      <CreateFileModal
        isOpen={showCreateFileModal}
        onClose={() => setShowCreateFileModal(false)}
        onCreateFile={handleCreateFile}
      />

      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onCreateFolder={handleCreateFolder}
      />
    </>
  );
}

export function FileTree({
  files,
  selectedFileId,
  expandedFolders,
  onFileSelect,
  onFolderToggle,
  onCreateFile,
  onCreateFolder,
  onDeleteFile,
  onRenameFile,
  onImportProject
}: FileTreeProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCreateFileModal, setShowCreateFileModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.zip')) {
      onImportProject(file);
    }
    // Reset input
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleCreateFile = async (fileName: string) => {
    await onCreateFile(fileName);
  };

  const handleCreateFolder = async (folderName: string) => {
    await onCreateFolder(folderName);
  };

  return (
    <div className="w-64 bg-card border-r border-border flex-col hidden md:flex" data-testid="file-tree">
      {/* File Tree Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <h2 className="font-medium text-sm">Files</h2>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6"
            onClick={() => setShowCreateFileModal(true)}
            title="New File"
            data-testid="button-create-file"
          >
            <Plus size={12} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6"
            onClick={() => setShowCreateFolderModal(true)}
            title="New Folder"
            data-testid="button-create-folder"
          >
            <FolderPlus size={12} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6"
            onClick={() => fileInputRef.current?.click()}
            title="Upload ZIP"
            data-testid="button-upload-zip"
          >
            <Upload size={12} />
          </Button>
        </div>
      </div>

      {/* File Tree Content */}
      <div className="flex-1 overflow-y-auto p-2" data-testid="file-tree-content">
        {files.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            No files yet. Create a new file or upload a project.
          </div>
        ) : (
          <div className="space-y-1">
            {files.map((file) => (
              <FileTreeItem
                key={file.id}
                file={file}
                level={0}
                selectedFileId={selectedFileId}
                expandedFolders={expandedFolders}
                onFileSelect={onFileSelect}
                onFolderToggle={onFolderToggle}
                onCreateFile={onCreateFile}
                onCreateFolder={onCreateFolder}
                onDeleteFile={onDeleteFile}
                onRenameFile={onRenameFile}
              />
            ))}
          </div>
        )}
      </div>

      {/* Hidden file input for uploads */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".zip"
        onChange={handleFileUpload}
        className="hidden"
        data-testid="file-upload-input"
      />

      <CreateFileModal
        isOpen={showCreateFileModal}
        onClose={() => setShowCreateFileModal(false)}
        onCreateFile={handleCreateFile}
      />

      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onCreateFolder={handleCreateFolder}
      />
    </div>
  );
}
