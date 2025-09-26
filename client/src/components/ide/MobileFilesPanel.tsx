import { useState } from 'react';
import { FileItem } from '@/types/ide';
import { FileUtils } from '@/lib/fileUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  X,
  Plus,
  Upload,
  ChevronRight,
  File,
  Folder,
  MoreVertical
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MobileFilesPanelProps {
  isOpen: boolean;
  files: FileItem[];
  selectedFileId: string | null;
  onClose: () => void;
  onFileSelect: (fileId: string) => void;
  onCreateFile: (name: string, parentId?: string) => Promise<string | undefined>;
  onCreateFolder: (name: string, parentId?: string) => Promise<string | undefined>;
  onDeleteFile: (fileId: string) => void;
  onRenameFile: (fileId: string, newName: string) => void;
  onImportProject: (file: File) => void;
}

interface MobileFileItemProps {
  file: FileItem;
  isSelected: boolean;
  onSelect: () => void;
  onOptions: () => void;
}

function MobileFileItem({ file, isSelected, onSelect, onOptions }: MobileFileItemProps) {
  return (
    <div
      className={`flex items-center justify-between p-3 bg-card rounded-lg border border-border cursor-pointer ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onSelect}
      data-testid={`mobile-file-item-${file.name}`}
    >
      <div className="flex items-center space-x-3">
        {file.type === 'folder' ? (
          <Folder className="text-accent" size={20} />
        ) : (
          <File className="text-primary" size={20} />
        )}
        <div>
          <div className="font-medium text-sm" data-testid={`mobile-file-name-${file.name}`}>
            {file.name}
          </div>
          {file.type === 'file' && file.size !== undefined && (
            <div className="text-xs text-muted-foreground">
              {FileUtils.formatFileSize(file.size)}
            </div>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="p-1 h-6 w-6"
        onClick={(e) => {
          e.stopPropagation();
          onOptions();
        }}
        data-testid={`mobile-file-options-${file.name}`}
      >
        {file.type === 'folder' ? <ChevronRight size={14} /> : <MoreVertical size={14} />}
      </Button>
    </div>
  );
}

export function MobileFilesPanel({
  isOpen,
  files,
  selectedFileId,
  onClose,
  onFileSelect,
  onCreateFile,
  onCreateFolder,
  onDeleteFile,
  onRenameFile,
  onImportProject
}: MobileFilesPanelProps) {
  const [currentFolder, setCurrentFolder] = useState<FileItem | null>(null);
  const [showOptions, setShowOptions] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const { toast } = useToast();

  const getCurrentFiles = (): FileItem[] => {
    if (currentFolder) {
      return currentFolder.children || [];
    }
    return files;
  };

  const handleFileSelect = (file: FileItem) => {
    if (file.type === 'folder') {
      setCurrentFolder(file);
    } else {
      onFileSelect(file.id);
      onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.zip')) {
      onImportProject(file);
      onClose();
    }
    // Reset input
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleCreateFile = async () => {
    const fileName = prompt('Enter file name:');
    if (fileName?.trim()) {
      const fileId = await onCreateFile(fileName.trim(), currentFolder?.id);
      if (fileId) {
        toast({
          title: "File created",
          description: `${fileName} has been created`
        });
      }
    }
  };

  const handleCreateFolder = async () => {
    const folderName = prompt('Enter folder name:');
    if (folderName?.trim()) {
      const folderId = await onCreateFolder(folderName.trim(), currentFolder?.id);
      if (folderId) {
        toast({
          title: "Folder created",
          description: `${folderName} folder has been created`
        });
      }
    }
  };

  const handleRename = (fileId: string) => {
    const file = getCurrentFiles().find(f => f.id === fileId);
    if (file) {
      setNewName(file.name);
      setIsRenaming(fileId);
      setShowOptions(null);
    }
  };

  const confirmRename = () => {
    if (isRenaming && newName.trim()) {
      onRenameFile(isRenaming, newName.trim());
      setIsRenaming(null);
      setNewName('');
      toast({
        title: "File renamed",
        description: `File renamed to ${newName}`
      });
    }
  };

  const handleDelete = (fileId: string) => {
    const file = getCurrentFiles().find(f => f.id === fileId);
    if (file && confirm(`Are you sure you want to delete ${file.name}?`)) {
      onDeleteFile(fileId);
      setShowOptions(null);
      toast({
        title: "File deleted",
        description: `${file.name} has been deleted`
      });
    }
  };

  const handleDownload = (file: FileItem) => {
    if (file.type === 'file' && file.content !== undefined) {
      FileUtils.downloadFile(file.name, file.content);
      setShowOptions(null);
      toast({
        title: "File downloaded",
        description: `${file.name} has been downloaded`
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background z-40 md:hidden" data-testid="mobile-files-panel">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center space-x-2">
            {currentFolder && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentFolder(null)}
                className="p-1"
                data-testid="button-back-to-root"
              >
                ←
              </Button>
            )}
            <h2 className="font-semibold">
              {currentFolder ? currentFolder.name : 'Files'}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
            data-testid="button-close-mobile-files"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Files List */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {getCurrentFiles().length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <File className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No files in this {currentFolder ? 'folder' : 'project'}</p>
              </div>
            ) : (
              getCurrentFiles().map((file) => (
                <div key={file.id}>
                  {isRenaming === file.id ? (
                    <div className="p-3 bg-card rounded-lg border border-border">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onBlur={confirmRename}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') confirmRename();
                          if (e.key === 'Escape') {
                            setIsRenaming(null);
                            setNewName('');
                          }
                        }}
                        autoFocus
                        data-testid="mobile-rename-input"
                      />
                    </div>
                  ) : (
                    <MobileFileItem
                      file={file}
                      isSelected={selectedFileId === file.id}
                      onSelect={() => handleFileSelect(file)}
                      onOptions={() => setShowOptions(showOptions === file.id ? null : file.id)}
                    />
                  )}

                  {/* Options Menu */}
                  {showOptions === file.id && file.type === 'file' && (
                    <div className="mt-2 p-2 bg-muted rounded-lg border border-border">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRename(file.id)}
                          className="flex-1"
                          data-testid="mobile-option-rename"
                        >
                          Rename
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(file)}
                          className="flex-1"
                          data-testid="mobile-option-download"
                        >
                          Download
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(file.id)}
                          className="flex-1 text-destructive"
                          data-testid="mobile-option-delete"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="p-4 space-y-2 border-t border-border">
          <div className="flex space-x-2">
            <Button
              onClick={handleCreateFile}
              className="flex-1"
              data-testid="mobile-button-create-file"
            >
              <Plus className="w-4 h-4 mr-2" />
              New File
            </Button>
            <Button
              variant="outline"
              onClick={handleCreateFolder}
              className="flex-1"
              data-testid="mobile-button-create-folder"
            >
              <Folder className="w-4 h-4 mr-2" />
              New Folder
            </Button>
          </div>
          
          <Button
            variant="outline"
            onClick={() => document.getElementById('mobile-file-upload')?.click()}
            className="w-full"
            data-testid="mobile-button-upload"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload ZIP Project
          </Button>
        </div>

        {/* Hidden file input */}
        <input
          id="mobile-file-upload"
          type="file"
          accept=".zip"
          onChange={handleFileUpload}
          className="hidden"
          data-testid="mobile-file-upload-input"
        />
      </div>
    </div>
  );
}
