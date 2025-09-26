import localforage from 'localforage';
import { FileItem, Project, EditorSettings } from '@/types/ide';

// Configure localforage
localforage.config({
  name: 'WebIDE',
  version: 1.0,
  storeName: 'webide_store',
  description: 'WebIDE offline storage'
});

export class StorageService {
  private static instance: StorageService;
  
  private constructor() {}
  
  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Project operations
  async saveProject(project: Project): Promise<void> {
    await localforage.setItem(`project_${project.id}`, project);
    
    // Update projects list
    const projects = await this.getProjectsList();
    const existingIndex = projects.findIndex(p => p.id === project.id);
    
    if (existingIndex >= 0) {
      projects[existingIndex] = { id: project.id, name: project.name, lastModified: project.lastModified };
    } else {
      projects.push({ id: project.id, name: project.name, lastModified: project.lastModified });
    }
    
    await localforage.setItem('projects_list', projects);
  }

  async getProject(projectId: string): Promise<Project | null> {
    return await localforage.getItem(`project_${projectId}`);
  }

  async getProjectsList(): Promise<Array<{ id: string; name: string; lastModified: number }>> {
    const projects = await localforage.getItem('projects_list');
    return projects as Array<{ id: string; name: string; lastModified: number }> || [];
  }

  async deleteProject(projectId: string): Promise<void> {
    await localforage.removeItem(`project_${projectId}`);
    
    const projects = await this.getProjectsList();
    const filteredProjects = projects.filter(p => p.id !== projectId);
    await localforage.setItem('projects_list', filteredProjects);
  }

  // File operations
  async saveFile(projectId: string, file: FileItem): Promise<void> {
    const project = await this.getProject(projectId);
    if (!project) return;

    const updateFileInTree = (files: FileItem[], targetFile: FileItem): FileItem[] => {
      return files.map(f => {
        if (f.id === targetFile.id) {
          return { ...targetFile };
        }
        if (f.children) {
          return { ...f, children: updateFileInTree(f.children, targetFile) };
        }
        return f;
      });
    };

    project.files = updateFileInTree(project.files, file);
    project.lastModified = Date.now();
    
    await this.saveProject(project);
  }

  async getFile(projectId: string, fileId: string): Promise<FileItem | null> {
    const project = await this.getProject(projectId);
    if (!project) return null;

    const findFile = (files: FileItem[], id: string): FileItem | null => {
      for (const file of files) {
        if (file.id === id) return file;
        if (file.children) {
          const found = findFile(file.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    return findFile(project.files, fileId);
  }

  // Settings operations
  async saveSettings(settings: EditorSettings): Promise<void> {
    await localforage.setItem('editor_settings', settings);
  }

  async getSettings(): Promise<EditorSettings> {
    const settings = await localforage.getItem('editor_settings') as EditorSettings;
    return settings || {
      theme: 'system',
      fontSize: 14,
      tabSize: 2,
      editorTheme: 'vs-light',
      autoSave: true,
      wordWrap: false,
      minimap: true,
      lineNumbers: true
    };
  }

  // Storage info
  async getStorageInfo(): Promise<{ used: number; available: number }> {
    // Estimate storage usage
    let totalSize = 0;
    await localforage.iterate((value) => {
      totalSize += JSON.stringify(value).length;
    });

    return {
      used: totalSize,
      available: 50 * 1024 * 1024 // 50MB estimate
    };
  }

  async clearAllData(): Promise<void> {
    await localforage.clear();
  }
}

export const storage = StorageService.getInstance();
