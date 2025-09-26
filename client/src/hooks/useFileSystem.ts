import { useState, useCallback, useEffect } from 'react';
import { FileItem, Project } from '@/types/ide';
import { storage } from '@/lib/storage';
import { FileUtils } from '@/lib/fileUtils';
import { useToast } from '@/hooks/use-toast';

export function useFileSystem() {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    initializeProject();
  }, []);

  const initializeProject = async () => {
    try {
      const projects = await storage.getProjectsList();

      if (projects.length > 0) {
        const latestProject = projects.sort((a, b) => b.lastModified - a.lastModified)[0];
        const project = await storage.getProject(latestProject.id);
        if (project) {
          setCurrentProject(project);
        } else {
          createNewProject();
        }
      } else {
        createNewProject();
      }
    } catch (error) {
      console.error('Failed to initialize project:', error);
      createNewProject();
    }
  };

  const createNewProject = useCallback(async () => {
    const project: Project = {
      id: FileUtils.generateId(),
      name: 'My Project',
      files: [
        {
          id: FileUtils.generateId(),
          name: 'index.html',
          type: 'file',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hello World</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Welcome to WebIDE</h1>
        <p>Start coding in your mobile-friendly IDE!</p>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
          path: 'index.html',
          size: 0,
          lastModified: Date.now()
        },
        {
          id: FileUtils.generateId(),
          name: 'style.css',
          type: 'file',
          content: `body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    margin: 0;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.container {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    text-align: center;
    max-width: 500px;
}

h1 {
    color: #333;
    margin-bottom: 1rem;
}

p {
    color: #666;
    line-height: 1.6;
}`,
          path: 'style.css',
          size: 0,
          lastModified: Date.now()
        },
        {
          id: FileUtils.generateId(),
          name: 'script.js',
          type: 'file',
          content: `console.log('Welcome to WebIDE!');

document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.container');

    if (container) {
        container.addEventListener('click', function() {
            const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            document.body.style.background = \`linear-gradient(135deg, \${randomColor} 0%, #764ba2 100%)\`;
        });
    }
});`,
          path: 'script.js',
          size: 0,
          lastModified: Date.now()
        }
      ],
      lastModified: Date.now()
    };

    await storage.saveProject(project);
    setCurrentProject(project);

    toast({
      title: "New project created",
      description: "Ready to start coding!"
    });
  }, [toast]);

  const createFile = useCallback(async (name: string, parentId?: string) => {
    if (!currentProject) return;

    console.log('Creating file:', name, 'parent:', parentId, 'existing files:', currentProject.files.map(f => f.name));

    // Check for duplicate names in the same location
    const existingFiles = parentId ? 
      findFile(currentProject.files, parentId)?.children || [] : 
      currentProject.files;

    const existingFile = existingFiles.find(f => f.name === name && f.type === 'file');
    if (existingFile) {
      console.warn('File with name already exists:', name);
      toast({
        title: "File already exists",
        description: `A file named ${name} already exists`,
        variant: "destructive"
      });
      return existingFile.id;
    }

    const newFile: FileItem = {
      id: FileUtils.generateId(),
      name,
      type: 'file',
      content: '',
      parentId,
      path: parentId ? `${findFile(currentProject.files, parentId)?.path}/${name}` : name,
      size: 0,
      lastModified: Date.now()
    };

    console.log('New file created with ID:', newFile.id);

    const updatedProject = { ...currentProject };

    if (parentId) {
      const addFileToParent = (files: FileItem[]): FileItem[] => {
        return files.map(file => {
          if (file.id === parentId && file.type === 'folder') {
            return {
              ...file,
              children: [...(file.children || []), newFile]
            };
          }
          if (file.children) {
            return { ...file, children: addFileToParent(file.children) };
          }
          return file;
        });
      };
      updatedProject.files = addFileToParent(updatedProject.files);
    } else {
      updatedProject.files.push(newFile);
    }

    updatedProject.lastModified = Date.now();
    await storage.saveProject(updatedProject);
    setCurrentProject(updatedProject);

    toast({
      title: "File created",
      description: `${name} has been created`
    });

    return newFile.id;
  }, [currentProject, toast]);

  const createFolder = useCallback(async (name: string, parentId?: string) => {
    if (!currentProject) return;

    const newFolder: FileItem = {
      id: FileUtils.generateId(),
      name,
      type: 'folder',
      children: [],
      parentId,
      path: parentId ? `${findFile(currentProject.files, parentId)?.path}/${name}` : name,
      lastModified: Date.now()
    };

    const updatedProject = { ...currentProject };

    if (parentId) {
      const addFolderToParent = (files: FileItem[]): FileItem[] => {
        return files.map(file => {
          if (file.id === parentId && file.type === 'folder') {
            return {
              ...file,
              children: [...(file.children || []), newFolder]
            };
          }
          if (file.children) {
            return { ...file, children: addFolderToParent(file.children) };
          }
          return file;
        });
      };
      updatedProject.files = addFolderToParent(updatedProject.files);
    } else {
      updatedProject.files.push(newFolder);
    }

    updatedProject.lastModified = Date.now();
    await storage.saveProject(updatedProject);
    setCurrentProject(updatedProject);

    toast({
      title: "Folder created",
      description: `${name} folder has been created`
    });

    return newFolder.id;
  }, [currentProject, toast]);

  const deleteFile = useCallback(async (fileId: string) => {
    if (!currentProject) return;

    const removeFileFromTree = (files: FileItem[]): FileItem[] => {
      return files.filter(file => {
        if (file.id === fileId) return false;
        if (file.children) {
          file.children = removeFileFromTree(file.children);
        }
        return true;
      });
    };

    const updatedProject = {
      ...currentProject,
      files: removeFileFromTree(currentProject.files),
      lastModified: Date.now()
    };

    await storage.saveProject(updatedProject);
    setCurrentProject(updatedProject);

    if (selectedFileId === fileId) {
      setSelectedFileId(null);
    }

    toast({
      title: "File deleted",
      description: "File has been removed from the project"
    });
  }, [currentProject, selectedFileId, toast]);

  const duplicateFile = useCallback(async (fileId: string) => {
    if (!currentProject) return;

    const sourceFile = findFile(currentProject.files, fileId);
    if (!sourceFile || sourceFile.type !== 'file') return;

    const duplicatedFile = FileUtils.duplicateFile(sourceFile);

    const updatedProject = { ...currentProject };

    if (sourceFile.parentId) {
      const addFileToParent = (files: FileItem[]): FileItem[] => {
        return files.map(file => {
          if (file.id === sourceFile.parentId && file.type === 'folder') {
            return {
              ...file,
              children: [...(file.children || []), duplicatedFile]
            };
          }
          if (file.children) {
            return { ...file, children: addFileToParent(file.children) };
          }
          return file;
        });
      };
      updatedProject.files = addFileToParent(updatedProject.files);
    } else {
      updatedProject.files.push(duplicatedFile);
    }

    updatedProject.lastModified = Date.now();
    await storage.saveProject(updatedProject);
    setCurrentProject(updatedProject);

    toast({
      title: "File duplicated",
      description: `${duplicatedFile.name} has been created`
    });

    return duplicatedFile.id;
  }, [currentProject, findFile, toast]);

  const moveFile = useCallback(async (fileId: string, newParentId?: string) => {
    if (!currentProject) return;

    const fileToMove = findFile(currentProject.files, fileId);
    if (!fileToMove) return;

    // Remove file from current location
    const removeFileFromTree = (files: FileItem[]): FileItem[] => {
      return files.filter(file => {
        if (file.id === fileId) return false;
        if (file.children) {
          file.children = removeFileFromTree(file.children);
        }
        return true;
      });
    };

    // Update file's parent reference
    const movedFile = {
      ...fileToMove,
      parentId: newParentId,
      path: newParentId ? 
        `${findFile(currentProject.files, newParentId)?.path}/${fileToMove.name}` : 
        fileToMove.name
    };

    let updatedFiles = removeFileFromTree(currentProject.files);

    // Add file to new location
    if (newParentId) {
      const addFileToParent = (files: FileItem[]): FileItem[] => {
        return files.map(file => {
          if (file.id === newParentId && file.type === 'folder') {
            return {
              ...file,
              children: [...(file.children || []), movedFile]
            };
          }
          if (file.children) {
            return { ...file, children: addFileToParent(file.children) };
          }
          return file;
        });
      };
      updatedFiles = addFileToParent(updatedFiles);
    } else {
      updatedFiles.push(movedFile);
    }

    const updatedProject = {
      ...currentProject,
      files: updatedFiles,
      lastModified: Date.now()
    };

    await storage.saveProject(updatedProject);
    setCurrentProject(updatedProject);

    toast({
      title: "File moved",
      description: `${fileToMove.name} has been moved`
    });
  }, [currentProject, findFile, toast]);

  const clearWorkspace = useCallback(async () => {
    if (!currentProject) return;

    const clearedProject = {
      ...currentProject,
      files: [],
      lastModified: Date.now()
    };

    await storage.saveProject(clearedProject);
    setCurrentProject(clearedProject);
    setSelectedFileId(null);
    setExpandedFolders(new Set());

    toast({
      title: "Workspace cleared",
      description: "All files have been removed from the project"
    });
  }, [currentProject, toast]);

  const renameFile = useCallback(async (fileId: string, newName: string) => {
    if (!currentProject) return;

    const updateFileName = (files: FileItem[]): FileItem[] => {
      return files.map(file => {
        if (file.id === fileId) {
          return { ...file, name: newName, lastModified: Date.now() };
        }
        if (file.children) {
          return { ...file, children: updateFileName(file.children) };
        }
        return file;
      });
    };

    const updatedProject = {
      ...currentProject,
      files: updateFileName(currentProject.files),
      lastModified: Date.now()
    };

    await storage.saveProject(updatedProject);
    setCurrentProject(updatedProject);

    toast({
      title: "File renamed",
      description: `File renamed to ${newName}`
    });
  }, [currentProject, toast]);

  const updateFileContent = async (fileId: string, content: string) => {
    const updateInFiles = (files: FileItem[]): FileItem[] => {
      return files.map(file => {
        if (file.id === fileId) {
          return { ...file, content };
        }
        if (file.type === 'folder' && file.children) {
          return { ...file, children: updateInFiles(file.children) };
        }
        return file;
      });
    };

    if (currentProject) {
      const updatedProject = {
        ...currentProject,
        files: updateInFiles(currentProject.files)
      };
      setCurrentProject(updatedProject);
      await storage.saveProject(updatedProject);
    }
  };

  const findFile = useCallback((files: FileItem[], fileId: string): FileItem | null => {
    for (const file of files) {
      if (file.id === fileId) return file;
      if (file.children) {
        const found = findFile(file.children, fileId);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const updateProjectName = async (newName: string) => {
    if (currentProject) {
      const updatedProject = {
        ...currentProject,
        name: newName.trim()
      };
      setCurrentProject(updatedProject);
      await storage.saveProject(updatedProject);
    }
  };

  const getSelectedFile = useCallback(() => {
    if (!currentProject || !selectedFileId) return null;
    return findFile(currentProject.files, selectedFileId);
  }, [currentProject, selectedFileId, findFile]);

  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  }, []);

  const exportProject = useCallback(async () => {
    if (!currentProject) return;

    try {
      const blob = await FileUtils.exportProjectAsZip(currentProject);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentProject.name}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Project exported",
        description: `${currentProject.name}.zip has been downloaded`
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export project",
        variant: "destructive"
      });
    }
  }, [currentProject, toast]);

  const importProject = useCallback(async (zipFile: File) => {
    try {
      const files = await FileUtils.importProjectFromZip(zipFile);
      const projectName = zipFile.name.replace('.zip', '') || 'Imported Project';

      const project: Project = {
        id: FileUtils.generateId(),
        name: projectName,
        files,
        lastModified: Date.now()
      };

      await storage.saveProject(project);
      setCurrentProject(project);

      toast({
        title: "Project imported",
        description: `${projectName} has been imported successfully`
      });
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Failed to import project",
        variant: "destructive"
      });
    }
  }, [toast]);

  return {
    currentProject,
    selectedFileId,
    expandedFolders,
    setSelectedFileId,
    createFile,
    createFolder,
    deleteFile,
    renameFile,
    duplicateFile,
    moveFile,
    updateFileContent,
    updateProjectName,
    findFile,
    getSelectedFile,
    toggleFolder,
    exportProject,
    importProject,
    createNewProject,
    clearWorkspace
  };
}