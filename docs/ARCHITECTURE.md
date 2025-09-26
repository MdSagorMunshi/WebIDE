# WebIDE Architecture Documentation

## Overview

WebIDE is a modern, mobile-first web-based Integrated Development Environment built with React, TypeScript, and Monaco Editor. The application follows a client-side architecture with offline-first design principles, ensuring a seamless coding experience across all devices.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    WebIDE Application                       │
├─────────────────────────────────────────────────────────────┤
│  Client (React + TypeScript)                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   IDE Interface │  │  Monaco Editor  │  │  File System │ │
│  │                 │  │                 │  │              │ │
│  │  - File Tree    │  │  - Syntax High. │  │  - Projects  │ │
│  │  - Tabs         │  │  - IntelliSense │  │  - Files     │ │
│  │  - Preview      │  │  - Formatting   │  │  - Folders   │ │
│  │  - Settings     │  │  - Themes       │  │  - Storage   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Storage Layer (IndexedDB + LocalForage)                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Projects      │  │    Settings     │  │   Cache      │ │
│  │                 │  │                 │  │              │ │
│  │  - File Data    │  │  - Editor Prefs │  │  - Assets    │ │
│  │  - Metadata     │  │  - UI Settings  │  │  - Static    │ │
│  │  - History      │  │  - Themes       │  │  - Runtime   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Service Worker (PWA + Offline Support)                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Caching       │  │   Offline       │  │   Updates    │ │
│  │                 │  │                 │  │              │ │
│  │  - Static Assets│  │  - App Shell    │  │  - Version   │ │
│  │  - API Responses│  │  - Data Sync    │  │  - Migration │ │
│  │  - Runtime      │  │  - Background   │  │  - Cleanup   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Frontend
- **React 18.3.1**: Modern React with hooks and concurrent features
- **TypeScript 5.6.3**: Type-safe JavaScript development
- **Vite 5.4.20**: Fast build tool and development server
- **Monaco Editor 0.53.0**: VS Code's editor engine
- **Tailwind CSS 3.4.17**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives

#### Backend (Minimal)
- **Express.js 4.21.2**: Web server framework
- **LocalForage**: Client-side storage abstraction

#### Development Tools
- **ESBuild 0.25.0**: Fast JavaScript bundler
- **TSX 4.20.5**: TypeScript execution
- **PostCSS 8.4.47**: CSS processing
- **Autoprefixer 10.4.20**: CSS vendor prefixing

## Component Architecture

### Component Hierarchy

```
App
├── QueryClientProvider
├── ThemeProvider
├── TooltipProvider
├── Toaster
└── Router
    └── IDE (Main Component)
        ├── Desktop Header
        ├── File Tree (Desktop)
        ├── Editor Area
        │   ├── Editor Tabs
        │   ├── Editor Toolbar
        │   ├── Search Bar
        │   └── Monaco Editor
        ├── Preview Panel (Desktop)
        ├── Mobile Bottom Navigation
        ├── Mobile Files Panel
        ├── Settings Modal
        └── Warning Dialog
```

### Core Components

#### 1. IDE Component (`IDE.tsx`)
**Purpose**: Main application container and state management
**Responsibilities**:
- Application state management
- File system operations
- Editor state coordination
- Mobile/desktop view switching
- Keyboard shortcuts handling

**Key State**:
```typescript
interface IDEState {
  openTabs: EditorTab[];
  activeTabId: string | null;
  mobileView: MobileView;
  editorContent: string;
  searchQuery: string;
  splitView: boolean;
  secondaryTabId: string | null;
}
```

#### 2. Monaco Editor Component (`MonacoEditor.tsx`)
**Purpose**: Monaco Editor wrapper with configuration
**Responsibilities**:
- Monaco Editor initialization
- Editor configuration management
- Theme synchronization
- Split view support
- Code formatting integration

**Key Features**:
- Dynamic language detection
- Theme switching
- Split view editing
- Format action integration
- Responsive design

#### 3. File Tree Component (`FileTree.tsx`)
**Purpose**: File and folder navigation
**Responsibilities**:
- Hierarchical file display
- File operations (create, rename, delete)
- Drag and drop support
- Context menu handling
- Import/export functionality

**Key Features**:
- Recursive file rendering
- Expandable folders
- File type icons
- Drag and drop
- Context menus

#### 4. Preview Panel Component (`PreviewPanel.tsx`)
**Purpose**: Real-time file preview
**Responsibilities**:
- HTML preview with CSS/JS injection
- Markdown rendering
- JSON formatting
- Image display
- Text file rendering

**Supported Formats**:
- HTML/HTM: Live preview with CSS and JS
- Markdown: Rendered HTML
- JSON: Formatted display
- Images: SVG and binary file info
- Text: Plain text display

#### 5. Settings Modal Component (`SettingsModal.tsx`)
**Purpose**: Application configuration
**Responsibilities**:
- Editor settings management
- Theme configuration
- Storage information display
- Data management options

**Settings Categories**:
- Appearance: Theme selection
- Editor: Font size, tab size, themes
- Features: Auto-save, word wrap, minimap
- Storage: Usage information and cleanup

## State Management

### State Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    State Management                         │
├─────────────────────────────────────────────────────────────┤
│  Global State (React Context + Hooks)                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   File System   │  │    Settings     │  │    Theme     │ │
│  │                 │  │                 │  │              │ │
│  │  - Projects     │  │  - Editor Prefs │  │  - Light     │ │
│  │  - Files        │  │  - UI Settings  │  │  - Dark      │ │
│  │  - Folders      │  │  - Storage      │  │  - System    │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Local State (Component State)                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Editor        │  │   UI State      │  │   Modals     │ │
│  │                 │  │                 │  │              │ │
│  │  - Tabs         │  │  - Mobile View  │  │  - Settings  │ │
│  │  - Content      │  │  - Search       │  │  - Create    │ │
│  │  - Selection    │  │  - Navigation   │  │  - Warnings  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Persistent State (IndexedDB)                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Projects      │  │    Settings     │  │   Cache      │ │
│  │                 │  │                 │  │              │ │
│  │  - File Data    │  │  - Preferences  │  │  - Assets    │ │
│  │  - Metadata     │  │  - Themes       │  │  - Runtime   │ │
│  │  - History      │  │  - Config       │  │  - Static    │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Custom Hooks

#### 1. useFileSystem Hook
**Purpose**: File system operations and project management
**Key Functions**:
```typescript
const {
  currentProject,
  selectedFileId,
  expandedFolders,
  createFile,
  createFolder,
  deleteFile,
  renameFile,
  duplicateFile,
  moveFile,
  updateFileContent,
  exportProject,
  importProject,
  createNewProject,
  clearWorkspace
} = useFileSystem();
```

#### 2. useSettings Hook
**Purpose**: Application settings management
**Key Functions**:
```typescript
const {
  settings,
  storageInfo,
  updateSettings,
  clearAllData,
  updateStorageInfo
} = useSettings();
```

#### 3. use-mobile Hook
**Purpose**: Mobile device detection
**Key Functions**:
```typescript
const isMobile = useIsMobile();
```

#### 4. use-toast Hook
**Purpose**: Toast notification system
**Key Functions**:
```typescript
const { toast } = useToast();
```

## Data Flow

### File System Operations

```
User Action → Component → Hook → Storage → State Update → UI Update
     ↓           ↓         ↓        ↓          ↓           ↓
  Click File → FileTree → useFileSystem → IndexedDB → React State → Re-render
```

### Editor Operations

```
User Input → Monaco Editor → onChange → IDE State → File System → Storage
     ↓            ↓             ↓          ↓           ↓           ↓
  Type Code → Editor Event → Handler → State Update → Save File → IndexedDB
```

### Settings Management

```
User Change → Settings Modal → useSettings → Storage → Theme Update → UI
     ↓             ↓              ↓           ↓          ↓           ↓
  Select Theme → Modal → Hook → IndexedDB → ThemeProvider → Re-render
```

## Storage Architecture

### Local Storage Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Storage Architecture                     │
├─────────────────────────────────────────────────────────────┤
│  IndexedDB (via LocalForage)                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Projects      │  │    Settings     │  │   Metadata   │ │
│  │                 │  │                 │  │              │ │
│  │  - File Content │  │  - Editor Prefs │  │  - File Info │ │
│  │  - File Tree    │  │  - UI Settings  │  │  - Timestamps│ │
│  │  - Project Info │  │  - Themes       │  │  - Sizes     │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Service Worker Cache                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Static Assets │  │   Runtime       │  │   API Cache  │ │
│  │                 │  │                 │  │              │ │
│  │  - HTML/CSS/JS  │  │  - App Shell    │  │  - Responses │ │
│  │  - Fonts        │  │  - Components   │  │  - Data      │ │
│  │  - Images       │  │  - Resources    │  │  - Metadata  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Storage Service

```typescript
class StorageService {
  // Project operations
  async saveProject(project: Project): Promise<void>
  async getProject(projectId: string): Promise<Project | null>
  async getProjectsList(): Promise<ProjectSummary[]>
  async deleteProject(projectId: string): Promise<void>
  
  // File operations
  async saveFile(projectId: string, file: FileItem): Promise<void>
  async getFile(projectId: string, fileId: string): Promise<FileItem | null>
  
  // Settings operations
  async saveSettings(settings: EditorSettings): Promise<void>
  async getSettings(): Promise<EditorSettings>
  
  // Storage management
  async getStorageInfo(): Promise<StorageInfo>
  async clearAllData(): Promise<void>
}
```

## Performance Considerations

### Optimization Strategies

#### 1. Code Splitting
- Dynamic imports for Monaco Editor
- Lazy loading of components
- Route-based code splitting

#### 2. Caching
- Service worker for static assets
- IndexedDB for application data
- Memory caching for frequently accessed data

#### 3. Rendering Optimization
- React.memo for expensive components
- useMemo for expensive calculations
- useCallback for event handlers
- Virtual scrolling for large file trees

#### 4. Bundle Optimization
- Tree shaking for unused code
- Minification and compression
- Asset optimization
- CDN for external dependencies

### Performance Monitoring

```typescript
// Performance metrics to track
interface PerformanceMetrics {
  bundleSize: number;
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  storageUsage: number;
  cacheHitRate: number;
}
```

## Security Architecture

### Security Measures

#### 1. Client-Side Security
- Content Security Policy (CSP)
- XSS protection
- Input validation
- Safe HTML rendering

#### 2. Data Security
- Local storage encryption (planned)
- Secure file handling
- Input sanitization
- File type validation

#### 3. Network Security
- HTTPS enforcement
- CORS configuration
- Request validation
- Rate limiting (planned)

### Security Best Practices

```typescript
// Input validation example
const validateFileName = (name: string): boolean => {
  const validPattern = /^[a-zA-Z0-9._-]+$/;
  return validPattern.test(name) && name.length <= 255;
};

// Content sanitization example
const sanitizeHTML = (content: string): string => {
  return DOMPurify.sanitize(content);
};
```

## Mobile Architecture

### Mobile-First Design

#### 1. Responsive Layout
- Mobile-first CSS approach
- Flexible grid system
- Touch-friendly interfaces
- Adaptive navigation

#### 2. Touch Interactions
- Gesture support
- Touch-optimized controls
- Swipe navigation
- Long-press context menus

#### 3. Performance Optimization
- Reduced bundle size
- Optimized images
- Efficient rendering
- Battery-conscious operations

### Mobile Components

```typescript
// Mobile-specific components
interface MobileComponents {
  BottomNavigation: React.FC<BottomNavigationProps>;
  MobileFilesPanel: React.FC<MobileFilesPanelProps>;
  TouchFileTree: React.FC<TouchFileTreeProps>;
  SwipeGestures: React.FC<SwipeGesturesProps>;
}
```

## Progressive Web App (PWA)

### PWA Features

#### 1. App Shell
- Minimal HTML shell
- Fast loading
- Offline functionality
- App-like experience

#### 2. Service Worker
- Asset caching
- Offline support
- Background sync
- Push notifications (planned)

#### 3. Web App Manifest
- App metadata
- Icon definitions
- Display modes
- Theme colors

### PWA Configuration

```json
{
  "name": "WebIDE - Mobile Code Editor",
  "short_name": "WebIDE",
  "description": "A powerful web-based IDE optimized for mobile devices",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "any",
  "scope": "/",
  "icons": [...]
}
```

## Testing Strategy

### Testing Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Testing Strategy                         │
├─────────────────────────────────────────────────────────────┤
│  Unit Tests                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Components    │  │     Hooks       │  │   Utils      │ │
│  │                 │  │                 │  │              │ │
│  │  - React Tests  │  │  - Hook Tests   │  │  - Function  │ │
│  │  - Props        │  │  - State        │  │  - Logic     │ │
│  │  - Events       │  │  - Effects      │  │  - Edge Cases│ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Integration Tests                                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   File System   │  │   Editor        │  │   Storage    │ │
│  │                 │  │                 │  │              │ │
│  │  - Operations   │  │  - Monaco       │  │  - IndexedDB │ │
│  │  - Navigation   │  │  - Formatting   │  │  - Persistence│ │
│  │  - Validation   │  │  - Themes       │  │  - Migration │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  End-to-End Tests                                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   User Flows    │  │   Mobile        │  │   PWA        │ │
│  │                 │  │                 │  │              │ │
│  │  - Project      │  │  - Touch        │  │  - Install   │ │
│  │  - File Ops     │  │  - Navigation   │  │  - Offline   │ │
│  │  - Settings     │  │  - Responsive   │  │  - Updates   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Testing Tools

- **Jest**: Unit testing framework
- **React Testing Library**: Component testing
- **Cypress**: End-to-end testing
- **Playwright**: Cross-browser testing
- **MSW**: API mocking

## Deployment Architecture

### Deployment Options

#### 1. Static Hosting
- Vercel (recommended)
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

#### 2. Container Deployment
- Docker
- Kubernetes
- Docker Compose

#### 3. Server Deployment
- Node.js server
- PM2 process manager
- Nginx reverse proxy

### Build Process

```bash
# Development
npm run dev          # Vite dev server with HMR

# Production
npm run build        # Vite build + ESBuild server
npm run start        # Production server

# Type checking
npm run check        # TypeScript validation
```

### Environment Configuration

```typescript
// Environment variables
interface Environment {
  NODE_ENV: 'development' | 'production';
  PORT: number;
  REPL_ID?: string;
}
```

## Future Architecture Considerations

### Scalability

#### 1. Client-Side Scaling
- IndexedDB optimization
- Memory management
- Component virtualization
- Lazy loading

#### 2. Storage Scaling
- Data compression
- Efficient serialization
- Storage quotas
- Cleanup strategies

#### 3. Performance Optimization
- Static asset delivery
- Global distribution
- Edge computing
- Bundle optimization

### Advanced Features

#### 1. Real-time Collaboration
- WebSocket connections
- Operational transforms
- Conflict resolution
- Presence indicators

#### 2. Plugin System
- Extension API
- Plugin marketplace
- Sandboxed execution
- Version management

#### 3. AI Integration
- Code completion
- Error detection
- Code generation
- Documentation

## Conclusion

WebIDE's architecture is designed for scalability, performance, and user experience. The client-side focus with offline-first design ensures a responsive and reliable coding environment across all devices. The modular component architecture and custom hooks provide maintainable and extensible code, while the storage layer ensures data persistence and performance.

The architecture supports future enhancements including real-time collaboration, plugin systems, and AI integration, making it a solid foundation for a modern web-based IDE.

---

For more detailed information about specific components or implementation details, refer to the individual component documentation and the API documentation.
