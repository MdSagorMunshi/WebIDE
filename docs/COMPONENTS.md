# WebIDE Components Documentation

## Overview

This document provides detailed information about the React components that make up the WebIDE application. Each component is documented with its purpose, props, state, and key functionality.

## Component Index

### Core Components
- [IDE](#ide-component)
- [MonacoEditor](#monacoeditor-component)
- [FileTree](#filetree-component)
- [PreviewPanel](#previewpanel-component)
- [SettingsModal](#settingsmodal-component)

### UI Components
- [BottomNavigation](#bottomnavigation-component)
- [MobileFilesPanel](#mobilefilespanel-component)
- [ContextMenu](#contextmenu-component)
- [CreateFileModal](#createfilemodal-component)
- [CreateFolderModal](#createfoldermodal-component)

### Utility Components
- [ThemeProvider](#themeprovider-component)

## Core Components

### IDE Component

**File**: `client/src/pages/IDE.tsx`

**Purpose**: Main application container and state management hub

**Key Responsibilities**:
- Application state management
- File system operations coordination
- Editor state management
- Mobile/desktop view switching
- Keyboard shortcuts handling
- Toast notifications
- Warning dialogs

**Props**: None (Root component)

**State**:
```typescript
interface IDEState {
  // Tab management
  openTabs: EditorTab[];
  activeTabId: string | null;
  secondaryTabId: string | null;
  
  // Mobile view management
  mobileView: MobileView;
  showMobileFiles: boolean;
  showSettings: boolean;
  
  // Editor state
  editorContent: string;
  secondaryContent: string;
  
  // UI state
  searchQuery: string;
  showSearch: boolean;
  splitView: boolean;
  
  // Project management
  isEditingProjectName: boolean;
  editingProjectName: string;
  
  // Dialog state
  warningDialog: WarningDialogState;
}
```

**Key Features**:
- Multi-tab file editing
- Split view support
- Mobile-responsive design
- Auto-save functionality
- Keyboard shortcuts (Ctrl+S, Ctrl+P, Ctrl+N)
- Project import/export
- Theme switching
- Settings management

**Event Handlers**:
```typescript
// File operations
handleFileSelect(fileId: string): void
handleSaveFile(): Promise<void>
handleFormatCode(): Promise<void>

// Tab operations
handleCloseTab(tabId: string): void
handleTabSwitch(tabId: string): void

// Project operations
handleStartEditingProjectName(): void
handleSaveProjectName(): Promise<void>
handleClearWorkspace(): void

// Mobile operations
handleMobileViewChange(view: MobileView): void
handleToggleSplitView(): void
```

### MonacoEditor Component

**File**: `client/src/components/ide/MonacoEditor.tsx`

**Purpose**: Monaco Editor wrapper with configuration and theme management

**Props**:
```typescript
interface MonacoEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
  settings: EditorSettings;
  readOnly?: boolean;
  splitView?: boolean;
  secondaryValue?: string;
  secondaryLanguage?: string;
  onSecondaryChange?: (value: string) => void;
  onFormat?: () => void;
}
```

**State**:
```typescript
interface MonacoEditorState {
  editor: any; // Monaco editor instance
  secondaryEditor: any; // Secondary editor instance
  isLoading: boolean;
}
```

**Key Features**:
- Monaco Editor integration
- Dynamic language detection
- Theme synchronization
- Split view support
- Code formatting integration
- Responsive design
- Auto-layout

**Configuration**:
```typescript
const editorOptions = {
  value,
  language: FileUtils.getLanguageFromExtension(language),
  theme: settings.editorTheme,
  fontSize: settings.fontSize,
  tabSize: settings.tabSize,
  insertSpaces: true,
  wordWrap: settings.wordWrap ? 'on' : 'off',
  minimap: { enabled: settings.minimap },
  lineNumbers: settings.lineNumbers ? 'on' : 'off',
  automaticLayout: true,
  scrollBeyondLastLine: false,
  readOnly,
  contextmenu: true,
  selectOnLineNumbers: true,
  glyphMargin: true,
  folding: true,
  foldingStrategy: 'indentation',
  showFoldingControls: 'always',
  roundedSelection: false,
  scrollbar: {
    vertical: 'auto',
    horizontal: 'auto',
    useShadows: false,
    verticalHasArrows: true,
    horizontalHasArrows: true,
    verticalScrollbarSize: 17,
    horizontalScrollbarSize: 17,
    arrowSize: 30
  }
};
```

**Lifecycle**:
1. **Mount**: Load Monaco Editor and initialize
2. **Update**: Sync with props changes
3. **Unmount**: Dispose editor instances

### FileTree Component

**File**: `client/src/components/ide/FileTree.tsx`

**Purpose**: Hierarchical file and folder navigation with operations

**Props**:
```typescript
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
  onDuplicateFile: (fileId: string) => Promise<string | undefined>;
  onMoveFile: (fileId: string, newParentId?: string) => void;
  onImportProject: (file: File) => void;
}
```

**Key Features**:
- Recursive file tree rendering
- Expandable/collapsible folders
- File type icons
- Drag and drop support
- Context menus
- Inline renaming
- Import/export functionality
- Mobile-responsive design

**FileTreeItem Component**:
```typescript
interface FileTreeItemProps {
  file: FileItem;
  level: number;
  selectedFileId: string | null;
  expandedFolders: Set<string>;
  // ... same handlers as FileTree
}
```

**State**:
```typescript
interface FileTreeItemState {
  isRenaming: boolean;
  newName: string;
  contextMenu: { x: number; y: number } | null;
  showCreateFileModal: boolean;
  showCreateFolderModal: boolean;
  isDragOver: boolean;
}
```

**Operations**:
- **Create**: New files and folders
- **Rename**: Inline editing
- **Delete**: Confirmation dialog
- **Duplicate**: Copy with suffix
- **Move**: Drag and drop
- **Download**: Individual file download
- **Import**: ZIP project import

### PreviewPanel Component

**File**: `client/src/components/ide/PreviewPanel.tsx`

**Purpose**: Real-time file preview with multiple format support

**Props**:
```typescript
interface PreviewPanelProps {
  files: FileItem[];
  selectedFile: FileItem | null;
}
```

**State**:
```typescript
interface PreviewPanelState {
  previewContent: string;
  previewType: 'html' | 'markdown' | 'json' | 'image' | 'text';
}
```

**Supported Formats**:
- **HTML/HTM**: Live preview with CSS and JS injection
- **Markdown**: Rendered HTML with styling
- **JSON**: Formatted display with syntax highlighting
- **Images**: SVG display and binary file information
- **Text**: Plain text display with monospace font

**Key Features**:
- Real-time preview updates
- CSS and JS injection for HTML
- Markdown rendering with custom styles
- JSON formatting and validation
- Image preview support
- Refresh functionality
- Open in new window
- Responsive design

**Preview Generation**:
```typescript
// HTML Preview
generateHTMLPreview(): void
// - Find HTML file
// - Replace CSS links with inline styles
// - Replace JS links with inline scripts
// - Set preview content

// Markdown Preview
generateMarkdownPreview(): void
// - Convert markdown to HTML
// - Apply custom styling
// - Handle code blocks and syntax highlighting

// JSON Preview
generateJSONPreview(): void
// - Parse and format JSON
// - Display with syntax highlighting
// - Handle parse errors

// Image Preview
generateImagePreview(): void
// - Display SVG content directly
// - Show binary file information
// - Handle different image formats

// Text Preview
generateTextPreview(): void
// - Display plain text
// - Preserve formatting
// - Handle special characters
```

### SettingsModal Component

**File**: `client/src/components/ide/SettingsModal.tsx`

**Purpose**: Application settings and preferences management

**Props**:
```typescript
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EditorSettings;
  onUpdateSettings: (settings: Partial<EditorSettings>) => void;
  storageInfo: { used: number; available: number };
  onClearData: () => void;
}
```

**Settings Categories**:

#### Appearance Settings
- **Theme**: Light, Dark, System
- **Editor Theme**: Auto Light, Auto Dark, High Contrast

#### Editor Settings
- **Font Size**: 12px - 20px
- **Tab Size**: 2, 4, or 8 spaces
- **Auto Save**: Enable/disable
- **Word Wrap**: Enable/disable
- **Minimap**: Show/hide
- **Line Numbers**: Show/hide

#### Storage Settings
- **Storage Usage**: Visual progress bar
- **Used Space**: Display in human-readable format
- **Available Space**: Display in human-readable format
- **Clear Data**: Reset all application data

**Key Features**:
- Real-time settings updates
- Storage information display
- Data management options
- Responsive design
- Confirmation dialogs

## UI Components

### BottomNavigation Component

**File**: `client/src/components/ide/BottomNavigation.tsx`

**Purpose**: Mobile bottom navigation for view switching

**Props**:
```typescript
interface BottomNavigationProps {
  activeView: MobileView;
  onViewChange: (view: MobileView) => void;
}
```

**Navigation Items**:
- **Files**: File tree view
- **Editor**: Code editor view
- **Preview**: File preview view
- **Settings**: Application settings
- **Export**: Project export

**Key Features**:
- Touch-friendly interface
- Active state indication
- Smooth transitions
- Accessibility support

### MobileFilesPanel Component

**File**: `client/src/components/ide/MobileFilesPanel.tsx`

**Purpose**: Mobile-optimized file tree panel

**Props**:
```typescript
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
```

**Key Features**:
- Slide-in animation
- Touch-optimized interface
- Full file tree functionality
- Import/export support
- Responsive design

### ContextMenu Component

**File**: `client/src/components/ide/ContextMenu.tsx`

**Purpose**: Right-click context menu for file operations

**Props**:
```typescript
interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
  onDuplicate?: () => void;
  onCreateFile?: () => void;
  onCreateFolder?: () => void;
}
```

**Key Features**:
- Position-based rendering
- Conditional menu items
- Keyboard navigation
- Click-outside closing
- Accessibility support

### CreateFileModal Component

**File**: `client/src/components/ide/CreateFileModal.tsx`

**Purpose**: Modal for creating new files

**Props**:
```typescript
interface CreateFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFile: (name: string) => void;
}
```

**Key Features**:
- File name validation
- Extension suggestions
- Keyboard shortcuts
- Form validation
- Error handling

### CreateFolderModal Component

**File**: `client/src/components/ide/CreateFolderModal.tsx`

**Purpose**: Modal for creating new folders

**Props**:
```typescript
interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (name: string) => void;
}
```

**Key Features**:
- Folder name validation
- Duplicate name checking
- Keyboard shortcuts
- Form validation
- Error handling

## Utility Components

### ThemeProvider Component

**File**: `client/src/components/ThemeProvider.tsx`

**Purpose**: Theme management and context provider

**Props**:
```typescript
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: 'light' | 'dark' | 'system';
  storageKey?: string;
}
```

**Context**:
```typescript
interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}
```

**Key Features**:
- System theme detection
- Theme persistence
- CSS custom properties
- Smooth transitions
- Accessibility support

## Component Communication

### Data Flow

```
IDE (Root)
├── FileTree ←→ useFileSystem
├── MonacoEditor ←→ IDE State
├── PreviewPanel ←→ IDE State
├── SettingsModal ←→ useSettings
└── Mobile Components ←→ IDE State
```

### State Management

```typescript
// Global state (hooks)
const fileSystem = useFileSystem();
const settings = useSettings();
const theme = useTheme();

// Local state (components)
const [openTabs, setOpenTabs] = useState<EditorTab[]>([]);
const [activeTabId, setActiveTabId] = useState<string | null>(null);
const [mobileView, setMobileView] = useState<MobileView>('editor');
```

### Event Handling

```typescript
// File operations
const handleFileSelect = useCallback((fileId: string) => {
  // Update selected file
  // Open in editor
  // Create tab if needed
}, [dependencies]);

// Editor operations
const handleEditorChange = useCallback((value: string) => {
  // Update editor content
  // Mark tab as dirty
  // Trigger auto-save if enabled
}, [dependencies]);
```

## Performance Considerations

### Optimization Strategies

#### 1. Memoization
```typescript
// Expensive calculations
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

// Event handlers
const memoizedHandler = useCallback(() => {
  // Handler logic
}, [dependencies]);
```

#### 2. Component Splitting
- Large components split into smaller ones
- Conditional rendering for mobile/desktop
- Lazy loading for heavy components

#### 3. State Optimization
- Minimal state updates
- Batched updates
- Selective re-renders

### Performance Monitoring

```typescript
// Component performance tracking
const ComponentWithPerformanceTracking = () => {
  const startTime = performance.now();
  
  useEffect(() => {
    const endTime = performance.now();
    console.log(`Component render time: ${endTime - startTime}ms`);
  });
  
  return <div>Component content</div>;
};
```

## Testing Components

### Unit Testing

```typescript
// Example component test
import { render, screen, fireEvent } from '@testing-library/react';
import { FileTree } from './FileTree';

describe('FileTree', () => {
  it('renders files correctly', () => {
    const mockFiles = [
      { id: '1', name: 'test.js', type: 'file' as const }
    ];
    
    render(
      <FileTree
        files={mockFiles}
        selectedFileId={null}
        expandedFolders={new Set()}
        onFileSelect={jest.fn()}
        // ... other props
      />
    );
    
    expect(screen.getByText('test.js')).toBeInTheDocument();
  });
  
  it('handles file selection', () => {
    const onFileSelect = jest.fn();
    // Test implementation
  });
});
```

### Integration Testing

```typescript
// Example integration test
describe('IDE Integration', () => {
  it('creates and edits files', async () => {
    // Test file creation
    // Test file editing
    // Test file saving
    // Test file preview
  });
});
```

## Accessibility

### ARIA Support

```typescript
// Accessible component example
const AccessibleFileTree = () => {
  return (
    <div
      role="tree"
      aria-label="File tree"
      aria-expanded={isExpanded}
    >
      <div
        role="treeitem"
        aria-selected={isSelected}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        File content
      </div>
    </div>
  );
};
```

### Keyboard Navigation

```typescript
// Keyboard support
const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'Enter':
      // Activate item
      break;
    case 'ArrowDown':
      // Move to next item
      break;
    case 'ArrowUp':
      // Move to previous item
      break;
    case 'Escape':
      // Close menu
      break;
  }
};
```

## Conclusion

The WebIDE component architecture is designed for maintainability, performance, and user experience. Each component has a clear responsibility and well-defined interfaces. The modular design allows for easy testing, debugging, and future enhancements.

Key architectural principles:
- **Single Responsibility**: Each component has one clear purpose
- **Composition**: Components are composed to build complex UIs
- **Props Down, Events Up**: Clear data flow and event handling
- **Performance**: Optimized rendering and state management
- **Accessibility**: ARIA support and keyboard navigation
- **Mobile-First**: Responsive design and touch optimization

For more detailed information about specific components or implementation details, refer to the source code and the architecture documentation.
