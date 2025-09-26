# Overview

This is a ReactJS-based Web IDE (Integrated Development Environment) designed as a Progressive Web App (PWA) optimized for mobile devices and offline use. The application runs entirely client-side with no backend dependencies, providing a complete code editing environment with file management, syntax highlighting, and preview capabilities. It uses localStorage/IndexedDB for persistent storage, allowing users to create, edit, and manage coding projects directly in their browser.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The application uses a modern React architecture with TypeScript, built on Vite for fast development and optimized builds. The UI is constructed using shadcn/ui components with Radix UI primitives, providing a consistent and accessible design system. The application follows a component-based architecture with clear separation of concerns:

- **Core IDE Components**: Specialized components for file tree management, Monaco code editor integration, preview panels, and mobile-optimized interfaces
- **UI Components**: Reusable shadcn/ui components for buttons, dialogs, forms, and other interface elements
- **Custom Hooks**: Business logic encapsulated in hooks for file system operations, settings management, and mobile detection
- **Type Safety**: Complete TypeScript implementation with defined interfaces for files, projects, editor settings, and IDE state

## State Management and Data Flow

The application uses React's built-in state management combined with custom hooks for complex operations:

- **File System Hook**: Manages project files, folders, and CRUD operations
- **Settings Hook**: Handles editor preferences and configuration
- **Local State**: Component-level state for UI interactions and temporary data
- **Context Providers**: Theme management and toast notifications

## Progressive Web App (PWA) Architecture

The application is designed as a fully offline-capable PWA:

- **Service Worker**: Caches static assets and provides offline functionality
- **Web App Manifest**: Enables installation on mobile devices with native app-like experience
- **Responsive Design**: Mobile-first approach with adaptive layouts for different screen sizes
- **Touch Optimizations**: Mobile-specific interactions and navigation patterns

## Code Editor Integration

Monaco Editor is integrated as the core code editing engine:

- **Syntax Highlighting**: Support for multiple programming languages (JavaScript, TypeScript, HTML, CSS, Python, etc.)
- **IntelliSense**: Auto-completion and code assistance features
- **Multi-tab Editing**: Support for multiple open files with tab management
- **Split View**: Side-by-side editing capabilities
- **Find/Replace**: Built-in search and replace functionality

## File Management System

A comprehensive file system built on browser storage APIs:

- **Hierarchical Structure**: Support for nested folders and files
- **Drag and Drop**: File upload and reordering capabilities
- **Import/Export**: ZIP file import and project export functionality
- **Context Menus**: Right-click operations for file management
- **Auto-save**: Automatic saving of file changes

## Mobile-First Design

The interface adapts to mobile devices with specialized components:

- **Bottom Navigation**: Tab-based navigation for mobile screens
- **Touch-Friendly Controls**: Large tap targets and gesture support
- **Mobile File Panel**: Optimized file browser for small screens
- **Responsive Preview**: Adaptive preview panel for different orientations

## Preview System

Live preview capabilities for web content:

- **HTML Preview**: Real-time rendering of HTML content with CSS and JavaScript
- **Markdown Rendering**: Support for Markdown file preview
- **JSON Formatting**: Pretty-printed JSON display
- **Image Preview**: Support for image file display

# External Dependencies

## Core Framework and Build Tools

- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type safety and enhanced developer experience
- **Vite**: Fast build tool and development server
- **ESBuild**: JavaScript bundler for production builds

## UI and Styling

- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: Pre-built component library based on Radix UI
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: Icon library for consistent iconography
- **Inter & JetBrains Mono**: Web fonts for UI and code display

## Code Editor

- **Monaco Editor**: Microsoft's web-based code editor (VS Code engine)
- **Language Support**: Built-in syntax highlighting for multiple programming languages

## Storage and Data Management

- **localForage**: Enhanced localStorage/IndexedDB wrapper for better performance
- **JSZip**: ZIP file creation and extraction for import/export features

## Development and Utilities

- **React Query (TanStack Query)**: Data fetching and caching (prepared for future backend integration)
- **React Hook Form**: Form state management with validation
- **Zod**: Schema validation for type-safe data handling
- **date-fns**: Date manipulation utilities
- **clsx & tailwind-merge**: CSS class manipulation utilities

## PWA and Performance

- **Service Worker**: Custom implementation for offline caching
- **Web App Manifest**: PWA configuration for installability
- **Replit Plugins**: Development tools for Replit environment integration

The application is architected to be completely self-contained with no external API dependencies, making it suitable for offline use while maintaining the flexibility to add backend features in the future if needed.