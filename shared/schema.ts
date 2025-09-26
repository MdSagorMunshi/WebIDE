// Type definitions for WebIDE client-side storage
// This file contains TypeScript interfaces for the data models used in the application

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  parentId?: string;
  children?: FileItem[];
  path: string;
  size?: number;
  lastModified: number;
}

export interface EditorTab {
  id: string;
  fileId: string;
  title: string;
  language: string;
  content: string;
  isDirty: boolean;
  isActive: boolean;
}

export interface EditorSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  tabSize: number;
  editorTheme: string;
  autoSave: boolean;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
}

export interface Project {
  id: string;
  name: string;
  files: FileItem[];
  lastModified: number;
}

export interface ContextMenuData {
  x: number;
  y: number;
  fileId: string;
  fileName: string;
  isVisible: boolean;
}

export interface PreviewData {
  type: 'html' | 'markdown' | 'json' | 'image' | 'text';
  content: string;
  url?: string;
}

// Legacy types for server compatibility (if needed in future)
export interface User {
  id: string;
  username: string;
  password: string;
}

export interface InsertUser {
  username: string;
  password: string;
}
