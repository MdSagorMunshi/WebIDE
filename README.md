# WebIDE - Mobile-First Web-Based IDE

A powerful, mobile-optimized web-based Integrated Development Environment (IDE) built with React, TypeScript, and Monaco Editor. WebIDE provides a complete coding experience with offline support, project management, and real-time preview capabilities.

![WebIDE](https://img.shields.io/badge/WebIDE-v1.0.0-blue)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue)
![Monaco Editor](https://img.shields.io/badge/Monaco%20Editor-0.53.0-orange)

## 🌟 Features

### Core IDE Features
- **Monaco Editor Integration**: Full-featured code editor with syntax highlighting, IntelliSense, and code formatting
- **Multi-tab Support**: Open and edit multiple files simultaneously with tab management
- **Split View**: Side-by-side editing for comparing files
- **File Tree Navigation**: Hierarchical file and folder management
- **Real-time Preview**: Live preview for HTML, Markdown, JSON, and text files
- **Code Formatting**: Built-in code formatting with Prettier integration

### Project Management
- **Project Creation**: Create new projects with starter templates
- **File Operations**: Create, rename, delete, duplicate, and move files/folders
- **Import/Export**: Import projects from ZIP files and export projects as ZIP
- **Drag & Drop**: Intuitive file organization with drag-and-drop support
- **Context Menus**: Right-click context menus for quick file operations

### Mobile Optimization
- **Responsive Design**: Optimized for mobile devices with touch-friendly interface
- **Mobile Navigation**: Bottom navigation for easy mobile access
- **Touch Gestures**: Swipe and touch interactions for mobile users
- **Progressive Web App**: Install as a PWA for native app-like experience

### Offline Support
- **Local Storage**: All projects and settings stored locally using IndexedDB
- **Service Worker**: Offline functionality with caching
- **Auto-save**: Automatic saving of changes with configurable intervals
- **Data Persistence**: Projects persist across browser sessions

### Customization
- **Theme Support**: Light, dark, and system theme options
- **Editor Settings**: Configurable font size, tab size, word wrap, and more
- **Editor Themes**: Multiple Monaco Editor themes
- **Storage Management**: View and manage local storage usage

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MdSagorMunshi/WebIDE.git
   cd WebIDE
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5000`

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Editor**: Monaco Editor
- **UI Components**: Radix UI, Tailwind CSS
- **State Management**: React Hooks, Local Storage
- **Build Tool**: Vite, ESBuild
- **Storage**: IndexedDB (LocalForage)
- **Server**: Express.js

### Project Structure
```
WebIDE/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ide/        # IDE-specific components
│   │   │   └── ui/         # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   ├── pages/          # Page components
│   │   └── types/          # TypeScript type definitions
│   ├── public/             # Static assets
│   └── index.html          # HTML template
├── server/                 # Backend Express server
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Storage interface
│   └── vite.ts            # Vite integration
├── shared/                 # Shared code between client and server
│   └── schema.ts          # Type definitions
└── dist/                   # Build output
```

### Key Components

#### Core IDE Components
- **`IDE.tsx`**: Main IDE interface and state management
- **`MonacoEditor.tsx`**: Monaco Editor wrapper with configuration
- **`FileTree.tsx`**: File and folder tree navigation
- **`PreviewPanel.tsx`**: Real-time file preview
- **`SettingsModal.tsx`**: Application settings and preferences

#### Hooks
- **`useFileSystem.ts`**: File system operations and project management
- **`useSettings.ts`**: Application settings management
- **`use-mobile.tsx`**: Mobile device detection
- **`use-toast.ts`**: Toast notification system

#### Utilities
- **`fileUtils.ts`**: File operations, formatting, and utilities
- **`storage.ts`**: Local storage management with IndexedDB
- **`utils.ts`**: General utility functions

## 📱 Mobile Features

### Responsive Design
- Mobile-first design approach
- Touch-friendly interface elements
- Optimized for various screen sizes
- Gesture support for navigation

### Progressive Web App
- Installable on mobile devices
- Offline functionality
- App-like experience
- Service worker for caching

### Mobile Navigation
- Bottom navigation bar
- Swipe gestures
- Touch-optimized file tree
- Mobile-specific modals and panels

## 🔧 Configuration

### Environment Variables
```bash
# Server
PORT=5000
NODE_ENV=development
```

### Editor Settings
- Font size: 12px - 20px
- Tab size: 2, 4, or 8 spaces
- Themes: Light, Dark, System
- Auto-save: Configurable intervals
- Word wrap: On/Off
- Minimap: On/Off
- Line numbers: On/Off

## 🎯 Usage

### Creating a Project
1. Click the "New Project" button
2. A new project with starter files will be created
3. Start editing files in the file tree

### File Operations
- **Create**: Right-click in file tree → "New File" or "New Folder"
- **Rename**: Right-click file → "Rename" or double-click
- **Delete**: Right-click file → "Delete"
- **Duplicate**: Right-click file → "Duplicate"
- **Move**: Drag and drop files between folders

### Editing Files
- Click on any file to open it in the editor
- Use tabs to switch between open files
- Save with Ctrl+S or enable auto-save
- Format code with Ctrl+Shift+F

### Preview
- HTML files: Live preview with CSS and JS support
- Markdown files: Rendered markdown preview
- JSON files: Formatted JSON display
- Text files: Plain text display

### Import/Export
- **Import**: Upload a ZIP file through the file tree
- **Export**: Click "Export" button to download project as ZIP

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run check        # TypeScript type checking
```

### Code Style
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Tailwind CSS for styling

### Testing
```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch
```

## 📦 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Deploy automatically on push

### Netlify
1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - Build Command: `npm run build`
   - Publish Directory: `dist/public`
3. Deploy automatically on push

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - The code editor that powers VS Code
- [React](https://reactjs.org/) - The web framework used
- [Tailwind CSS](https://tailwindcss.com/) - The CSS framework
- [Radix UI](https://www.radix-ui.com/) - The UI component library
- [Vite](https://vitejs.dev/) - The build tool

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/MdSagorMunshi/WebIDE/issues)
- **Discussions**: [GitHub Discussions](https://github.com/MdSagorMunshi/WebIDE/discussions)
- **Email**: [Contact the maintainer](mailto:your-email@example.com)

## 🔮 Roadmap

### Upcoming Features
- [ ] Git integration
- [ ] Terminal/console integration
- [ ] Plugin system
- [ ] Collaborative editing
- [ ] Cloud storage integration
- [ ] Advanced debugging tools
- [ ] Code snippets
- [ ] Theme marketplace
- [ ] Performance monitoring
- [ ] Advanced search and replace

### Version History
- **v1.0.0** - Initial release with core IDE features
- **v1.1.0** - Mobile optimization and PWA support
- **v1.2.0** - Enhanced file operations and preview
- **v2.0.0** - Planned: Git integration and collaboration features

---

**WebIDE** - Code anywhere, anytime, on any device! 🚀
