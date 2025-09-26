# WebIDE API Documentation

## Overview

WebIDE is a client-side Progressive Web Application (PWA) with a minimal Express.js server for development. The application is designed to work entirely offline using local storage and does not require any external database.

## Server Architecture

### Technology Stack
- **Framework**: Express.js
- **Language**: TypeScript
- **Build Tool**: ESBuild
- **Storage**: LocalForage (IndexedDB)
- **Development**: Vite integration for HMR

### Server Structure
```
server/
├── index.ts          # Main server entry point
├── routes.ts         # API route definitions
├── storage.ts        # Storage interface and implementation
└── vite.ts           # Vite development server integration
```

## API Endpoints

### Current Implementation

The current server implementation is minimal and primarily serves the client application. The main endpoints are:

#### Static File Serving
- **GET** `/` - Serves the main HTML file
- **GET** `/src/*` - Serves client-side assets (development only)
- **GET** `/public/*` - Serves static assets (production)

#### Development Endpoints
- **GET** `/src/main.tsx` - Main React application entry point
- **GET** `/src/index.css` - Application styles
- **GET** `/src/**/*` - All client-side source files

### Future API Endpoints (Planned)

#### Authentication
```typescript
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/me
```

#### Project Management
```typescript
GET    /api/projects           # List user projects
POST   /api/projects           # Create new project
GET    /api/projects/:id       # Get project details
PUT    /api/projects/:id       # Update project
DELETE /api/projects/:id       # Delete project
```

#### File Operations
```typescript
GET    /api/projects/:id/files           # List project files
POST   /api/projects/:id/files           # Create new file
GET    /api/projects/:id/files/:fileId   # Get file content
PUT    /api/projects/:id/files/:fileId   # Update file content
DELETE /api/projects/:id/files/:fileId   # Delete file
```

#### Collaboration
```typescript
GET    /api/projects/:id/collaborators   # List collaborators
POST   /api/projects/:id/collaborators   # Add collaborator
DELETE /api/projects/:id/collaborators/:userId # Remove collaborator
```

## Data Models

### Client-Side Data Models

```typescript
// shared/schema.ts - Type definitions for client-side storage
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

export interface Project {
  id: string;
  name: string;
  files: FileItem[];
  lastModified: number;
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
```

## Storage Interface

### Server Storage Interface

The server uses a minimal memory-based storage interface for development:

```typescript
// server/storage.ts
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  
  // Implementation methods...
}
```

### Client-Side Storage

The client uses IndexedDB via LocalForage for persistent storage:

```typescript
// client/src/lib/storage.ts
export class StorageService {
  // Project operations
  async saveProject(project: Project): Promise<void>
  async getProject(projectId: string): Promise<Project | null>
  async getProjectsList(): Promise<Array<{ id: string; name: string; lastModified: number }>>
  async deleteProject(projectId: string): Promise<void>
  
  // File operations
  async saveFile(projectId: string, file: FileItem): Promise<void>
  async getFile(projectId: string, fileId: string): Promise<FileItem | null>
  
  // Settings operations
  async saveSettings(settings: EditorSettings): Promise<void>
  async getSettings(): Promise<EditorSettings>
  
  // Storage info
  async getStorageInfo(): Promise<{ used: number; available: number }>
  async clearAllData(): Promise<void>
}
```

## Development Server

### Vite Integration

The development server integrates with Vite for hot module replacement:

```typescript
// server/vite.ts
export async function setupVite(app: Express, server: Server) {
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: {
      middlewareMode: true,
      hmr: { server },
      allowedHosts: true,
    },
    appType: "custom",
  });

  app.use(vite.middlewares);
  // SPA fallback handling...
}
```

### Production Server

```typescript
// server/vite.ts
export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");
  
  app.use(express.static(distPath));
  
  // SPA fallback
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
```

## Configuration

### Environment Variables

```bash
# Server
PORT=5000
NODE_ENV=development

# Optional: Replit integration
REPL_ID=your-repl-id
```

### Build Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    // Replit-specific plugins (development only)
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
      ? [cartographer(), devBanner()]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
});
```

## Error Handling

### Server Error Handling

```typescript
// server/index.ts
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  res.status(status).json({ message });
  throw err;
});
```

### Request Logging

```typescript
// server/index.ts
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });

  next();
});
```

## Security Considerations

### Current Security Measures
- Input validation with Zod schemas
- CORS configuration (if needed)
- Request rate limiting (planned)
- Authentication middleware (planned)

### Planned Security Features
- JWT-based authentication
- Role-based access control
- File upload validation
- XSS protection
- CSRF protection

## Performance Optimization

### Current Optimizations
- Vite for fast development builds
- ESBuild for production bundling
- Service worker for caching
- IndexedDB for efficient local storage

### Planned Optimizations
- Database query optimization
- Redis caching
- CDN integration
- Image optimization
- Code splitting

## Monitoring and Logging

### Current Logging
- Request/response logging
- Error logging
- Development server logs

### Planned Monitoring
- Application performance monitoring
- Error tracking
- User analytics
- Database performance monitoring

## Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## Future API Roadmap

### Phase 1: Basic Server Features
- User authentication
- Project CRUD operations
- File management
- Basic collaboration

### Phase 2: Advanced Features
- Real-time collaboration
- Git integration
- Plugin system
- Advanced file operations

### Phase 3: Enterprise Features
- Team management
- Advanced permissions
- Audit logging
- Enterprise integrations

## Contributing to the API

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start development server: `npm run dev`

### Adding New Endpoints
1. Define the route in `server/routes.ts`
2. Implement the handler function
3. Add proper error handling
4. Update this documentation
5. Add tests (when test suite is implemented)

### Data Model Changes
1. Update the type definitions in `shared/schema.ts`
2. Update the storage interface
3. Test the changes

---

For more information about the client-side implementation, see the [Architecture Documentation](ARCHITECTURE.md).
