import JSZip from 'jszip';
import { FileItem } from '@/types/ide';

export class FileUtils {
  static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  static getLanguageFromExtension(extension: string): string {
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'html': 'html',
      'htm': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less',
      'json': 'json',
      'xml': 'xml',
      'md': 'markdown',
      'py': 'python',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'h': 'c',
      'hpp': 'cpp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'sql': 'sql',
      'yml': 'yaml',
      'yaml': 'yaml',
      'dockerfile': 'dockerfile',
      'sh': 'shell',
      'bash': 'shell',
      'zsh': 'shell',
      'fish': 'shell'
    };

    return languageMap[extension] || 'plaintext';
  }

  static getFileIcon(filename: string, isFolder: boolean): string {
    if (isFolder) {
      return 'fas fa-folder';
    }

    const extension = this.getFileExtension(filename);
    const iconMap: Record<string, string> = {
      'js': 'fas fa-file-code text-yellow-500',
      'jsx': 'fas fa-file-code text-blue-500',
      'ts': 'fas fa-file-code text-blue-600',
      'tsx': 'fas fa-file-code text-blue-600',
      'html': 'fas fa-file-code text-orange-500',
      'css': 'fas fa-file-code text-blue-400',
      'scss': 'fas fa-file-code text-pink-500',
      'sass': 'fas fa-file-code text-pink-500',
      'json': 'fas fa-file-code text-green-500',
      'md': 'fas fa-file-alt text-gray-600',
      'txt': 'fas fa-file-alt text-gray-500',
      'py': 'fas fa-file-code text-yellow-600',
      'java': 'fas fa-file-code text-red-500',
      'xml': 'fas fa-file-code text-orange-400',
      'yml': 'fas fa-file-code text-purple-500',
      'yaml': 'fas fa-file-code text-purple-500',
      'png': 'fas fa-file-image text-green-400',
      'jpg': 'fas fa-file-image text-green-400',
      'jpeg': 'fas fa-file-image text-green-400',
      'gif': 'fas fa-file-image text-green-400',
      'svg': 'fas fa-file-image text-green-400',
      'pdf': 'fas fa-file-pdf text-red-500',
      'zip': 'fas fa-file-archive text-yellow-600',
      'rar': 'fas fa-file-archive text-yellow-600',
      '7z': 'fas fa-file-archive text-yellow-600'
    };

    return iconMap[extension] || 'fas fa-file text-gray-400';
  }

  static async exportProjectAsZip(project: { name: string; files: FileItem[] }): Promise<Blob> {
    const zip = new JSZip();

    const addFilesToZip = (files: FileItem[], currentPath = '') => {
      files.forEach(file => {
        const filePath = currentPath ? `${currentPath}/${file.name}` : file.name;
        
        if (file.type === 'folder' && file.children) {
          addFilesToZip(file.children, filePath);
        } else if (file.type === 'file' && file.content !== undefined) {
          zip.file(filePath, file.content);
        }
      });
    };

    addFilesToZip(project.files);
    return await zip.generateAsync({ type: 'blob' });
  }

  static async importProjectFromZip(zipFile: File): Promise<FileItem[]> {
    const zip = await JSZip.loadAsync(zipFile);
    const files: FileItem[] = [];
    const folders: Map<string, FileItem> = new Map();

    // First pass: create all folders
    zip.forEach((relativePath, zipEntry) => {
      const pathParts = relativePath.split('/');
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        const folderPath = pathParts.slice(0, i + 1).join('/');
        
        if (!folders.has(folderPath)) {
          const folderId = this.generateId();
          const folder: FileItem = {
            id: folderId,
            name: pathParts[i],
            type: 'folder',
            path: folderPath,
            children: [],
            lastModified: Date.now()
          };
          folders.set(folderPath, folder);
        }
      }
    });

    // Second pass: create files and build hierarchy
    for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
      if (zipEntry.dir) continue;

      const pathParts = relativePath.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const parentPath = pathParts.slice(0, -1).join('/');

      const content = await zipEntry.async('text');
      const fileItem: FileItem = {
        id: this.generateId(),
        name: fileName,
        type: 'file',
        content,
        path: relativePath,
        size: content.length,
        lastModified: Date.now()
      };

      if (parentPath && folders.has(parentPath)) {
        const parentFolder = folders.get(parentPath)!;
        parentFolder.children!.push(fileItem);
        fileItem.parentId = parentFolder.id;
      } else {
        files.push(fileItem);
      }
    }

    // Add root folders to files array
    folders.forEach((folder, path) => {
      if (!path.includes('/')) {
        files.push(folder);
      } else {
        const parentPath = path.split('/').slice(0, -1).join('/');
        if (folders.has(parentPath)) {
          const parentFolder = folders.get(parentPath)!;
          parentFolder.children!.push(folder);
          folder.parentId = parentFolder.id;
        }
      }
    });

    return files;
  }

  static downloadFile(filename: string, content: string): void {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static duplicateFile(file: FileItem, suffix: string = 'copy'): FileItem {
    const nameParts = file.name.split('.');
    const extension = nameParts.length > 1 ? nameParts.pop() : '';
    const baseName = nameParts.join('.');
    const newName = extension ? `${baseName}_${suffix}.${extension}` : `${baseName}_${suffix}`;

    return {
      ...file,
      id: this.generateId(),
      name: newName,
      path: file.path.replace(file.name, newName),
      lastModified: Date.now()
    };
  }

  static async formatCode(content: string, language: string): Promise<string> {
    try {
      const prettier = await import('prettier');
      
      let parser;
      switch (language) {
        case 'javascript':
        case 'jsx':
          parser = 'babel';
          break;
        case 'typescript':
        case 'tsx':
          parser = 'typescript';
          break;
        case 'html':
          parser = 'html';
          break;
        case 'css':
        case 'scss':
        case 'sass':
          parser = 'css';
          break;
        case 'json':
          parser = 'json';
          break;
        case 'markdown':
          parser = 'markdown';
          break;
        default:
          return content; // Return unchanged if no parser available
      }

      return prettier.format(content, {
        parser,
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'es5',
        printWidth: 80
      });
    } catch (error) {
      console.warn('Failed to format code:', error);
      return content;
    }
  }

  static buildFilePath(files: FileItem[], fileId: string): string {
    const findPath = (items: FileItem[], id: string, currentPath = ''): string | null => {
      for (const item of items) {
        const newPath = currentPath ? `${currentPath}/${item.name}` : item.name;
        
        if (item.id === id) {
          return newPath;
        }
        
        if (item.children) {
          const found = findPath(item.children, id, newPath);
          if (found) return found;
        }
      }
      return null;
    };

    return findPath(files, fileId) || '';
  }
}
