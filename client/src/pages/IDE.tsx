import { useState, useEffect, useCallback } from 'react';
import { EditorTab, FileItem } from '@/types/ide';
import { FileUtils } from '@/lib/fileUtils';
import { useFileSystem } from '@/hooks/useFileSystem';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from '@/components/ThemeProvider';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

// Components
import { FileTree } from '@/components/ide/FileTree';
import { MonacoEditor } from '@/components/ide/MonacoEditor';
import { PreviewPanel } from '@/components/ide/PreviewPanel';
import { BottomNavigation } from '@/components/ide/BottomNavigation';
import { MobileFilesPanel } from '@/components/ide/MobileFilesPanel';
import { SettingsModal } from '@/components/ide/SettingsModal';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

// Icons
import {
  Code,
  Moon,
  Sun,
  Settings,
  Download,
  Plus,
  X,
  Save,
  Search,
  Columns,
  RotateCcw,
  FileText,
  Smartphone
} from 'lucide-react';

type MobileView = 'files' | 'editor' | 'preview' | 'settings' | 'export';

export default function IDE() {
  // Hooks
  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // File system
  const {
    currentProject,
    selectedFileId,
    expandedFolders,
    setSelectedFileId,
    createFile,
    createFolder,
    deleteFile,
    renameFile,
    updateFileContent,
    findFile,
    getSelectedFile,
    toggleFolder,
    exportProject,
    importProject,
    createNewProject
  } = useFileSystem();

  // Settings
  const {
    settings,
    storageInfo,
    updateSettings,
    clearAllData,
    updateStorageInfo
  } = useSettings();

  // State
  const [openTabs, setOpenTabs] = useState<EditorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>('editor');
  const [showMobileFiles, setShowMobileFiles] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // File operations
  const handleFileSelect = useCallback((fileId: string) => {
    const file = findFile(currentProject?.files || [], fileId);
    if (!file || file.type !== 'file') return;

    setSelectedFileId(fileId);

    // Check if tab is already open
    const existingTab = openTabs.find(tab => tab.fileId === fileId);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      setEditorContent(existingTab.content);
      return;
    }

    // Create new tab
    const newTab: EditorTab = {
      id: FileUtils.generateId(),
      fileId: file.id,
      title: file.name,
      language: FileUtils.getFileExtension(file.name),
      content: file.content || '',
      isDirty: false,
      isActive: true
    };

    setOpenTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setEditorContent(newTab.content);
  }, [currentProject?.files, findFile, setSelectedFileId, openTabs]);

  // Editor operations
  const handleEditorChange = (value: string) => {
    setEditorContent(value);

    // Mark tab as dirty
    if (activeTabId) {
      setOpenTabs(prev => prev.map(tab => 
        tab.id === activeTabId 
          ? { ...tab, content: value, isDirty: tab.content !== value }
          : tab
      ));
    }
  };

  const handleSaveFile = useCallback(async () => {
    if (!activeTabId || !selectedFileId) return;

    const tab = openTabs.find(t => t.id === activeTabId);
    if (!tab) return;

    try {
      await updateFileContent(selectedFileId, editorContent);

      // Mark tab as clean
      setOpenTabs(prev => prev.map(t => 
        t.id === activeTabId ? { ...t, content: editorContent, isDirty: false } : t
      ));

      toast({
        title: "File saved",
        description: `${tab.title} has been saved`
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save file",
        variant: "destructive"
      });
    }
  }, [activeTabId, selectedFileId, openTabs, editorContent, updateFileContent, toast]);


  // Auto-save functionality
  useEffect(() => {
    if (!settings.autoSave || !activeTabId || !editorContent) return;

    const timeoutId = setTimeout(() => {
      const activeTab = openTabs.find(tab => tab.id === activeTabId);
      if (activeTab && activeTab.content !== editorContent && activeTab.isDirty) {
        handleSaveFile();
      }
    }, 1000); // Auto-save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [editorContent, activeTabId, settings.autoSave, openTabs, handleSaveFile]);

  // Update theme based on settings
  useEffect(() => {
    setTheme(settings.theme);
  }, [settings.theme, setTheme]);

  // Handle mobile view changes
  const handleMobileViewChange = (view: MobileView) => {
    setMobileView(view);

    switch (view) {
      case 'files':
        setShowMobileFiles(true);
        break;
      case 'settings':
        setShowSettings(true);
        break;
      case 'export':
        exportProject();
        break;
    }
  };

  // Tab operations
  const handleCloseTab = (tabId: string) => {
    console.log('Closing tab:', tabId, 'Current tabs:', openTabs.map(t => ({ id: t.id, title: t.title })));

    const tab = openTabs.find(t => t.id === tabId);
    if (!tab) {
      console.error('Tab not found for ID:', tabId);
      return;
    }

    if (tab.isDirty && !confirm('You have unsaved changes. Close anyway?')) {
      return;
    }

    const newTabs = openTabs.filter(t => t.id !== tabId);
    console.log('New tabs after filter:', newTabs.map(t => ({ id: t.id, title: t.title })));
    setOpenTabs(newTabs);

    if (activeTabId === tabId) {
      const nextTab = newTabs[newTabs.length - 1];
      if (nextTab) {
        console.log('Switching to next tab:', nextTab.id, nextTab.title);
        setActiveTabId(nextTab.id);
        setEditorContent(nextTab.content);
        setSelectedFileId(nextTab.fileId);
      } else {
        console.log('No more tabs, clearing editor');
        setActiveTabId(null);
        setEditorContent('');
        setSelectedFileId(null);
      }
    }
  };

  const handleTabSwitch = (tabId: string) => {
    const tab = openTabs.find(t => t.id === tabId);
    if (!tab) return;

    setActiveTabId(tabId);
    setEditorContent(tab.content);
    setSelectedFileId(tab.fileId);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey)) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSaveFile();
            break;
          case 'p':
            e.preventDefault();
            setShowSearch(true);
            break;
          case 'n':
            e.preventDefault();
            createFile('new-file.txt');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveFile, createFile]);

  // Get current editor state
  const activeTab = openTabs.find(tab => tab.id === activeTabId);
  const selectedFile = getSelectedFile();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground" data-testid="ide-container">
      {/* Desktop Header */}
      {!isMobile && (
        <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border" data-testid="desktop-header">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Code className="text-primary text-xl" />
              <h1 className="text-lg font-semibold">WebIDE</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              {currentProject?.name || 'My Project'}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              data-testid="button-toggle-theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              data-testid="button-open-settings"
            >
              <Settings size={16} />
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={exportProject}
              data-testid="button-export-project"
            >
              <Download size={16} className="mr-1" />
              Export
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop File Tree */}
        {!isMobile && (
          <FileTree
            files={currentProject?.files || []}
            selectedFileId={selectedFileId}
            expandedFolders={expandedFolders}
            onFileSelect={handleFileSelect}
            onFolderToggle={toggleFolder}
            onCreateFile={createFile}
            onCreateFolder={createFolder}
            onDeleteFile={deleteFile}
            onRenameFile={renameFile}
            onImportProject={importProject}
          />
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col bg-background" data-testid="editor-area">
          {/* Editor Tabs */}
          {(!isMobile || mobileView === 'editor') && openTabs.length > 0 && (
            <div className="flex bg-card border-b border-border overflow-x-auto" data-testid="editor-tabs">
              {openTabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`flex items-center px-4 py-2 border-r border-border min-w-0 group cursor-pointer ${
                    activeTabId === tab.id ? 'tab-active bg-background' : 'hover:bg-muted'
                  }`}
                  onClick={() => handleTabSwitch(tab.id)}
                  data-testid={`editor-tab-${tab.title}`}
                >
                  <FileText size={14} className="mr-2 text-primary" />
                  <span className="text-sm truncate">
                    {tab.title}{tab.isDirty ? ' •' : ''}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 opacity-0 group-hover:opacity-100 hover:bg-muted rounded-full p-1 h-5 w-5"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseTab(tab.id);
                    }}
                    data-testid={`button-close-tab-${tab.title}`}
                  >
                    <X size={12} />
                  </Button>
                </div>
              ))}

              <Button
                variant="ghost"
                size="sm"
                className="px-3 py-2 hover:bg-muted transition-colors flex items-center"
                onClick={() => createFile('untitled.txt')}
                data-testid="button-new-tab"
              >
                <Plus size={14} />
              </Button>
            </div>
          )}

          {/* Editor Toolbar */}
          {(!isMobile || mobileView === 'editor') && activeTab && (
            <div className="flex items-center justify-between px-4 py-1 bg-muted/50 border-b border-border text-xs" data-testid="editor-toolbar">
              <div className="flex items-center space-x-4">
                <div className="text-muted-foreground">
                  {FileUtils.getLanguageFromExtension(activeTab.language)}
                </div>
                <div className="text-muted-foreground">
                  Line 1, Column 1
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6"
                  onClick={handleSaveFile}
                  title="Save (Ctrl+S)"
                  data-testid="button-save-file"
                >
                  <Save size={12} />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6"
                  onClick={() => setShowSearch(!showSearch)}
                  title="Find (Ctrl+P)"
                  data-testid="button-toggle-search"
                >
                  <Search size={12} />
                </Button>
              </div>
            </div>
          )}

          {/* Search Bar */}
          {showSearch && (
            <div className="px-4 py-2 bg-card border-b border-border">
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
                data-testid="input-search"
              />
            </div>
          )}

          {/* Monaco Editor */}
          {(!isMobile || mobileView === 'editor') && (
            <div className="flex-1 monaco-container" data-testid="editor-container">
              {activeTab ? (
                <MonacoEditor
                  value={editorContent}
                  language={activeTab.language}
                  onChange={handleEditorChange}
                  settings={settings}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-card text-muted-foreground">
                  <div className="text-center">
                    <Code className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">Welcome to WebIDE</p>
                    <p className="text-sm">Select a file to start editing or create a new one</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Views */}
          {isMobile && mobileView === 'preview' && (
            <div className="flex-1">
              <PreviewPanel
                files={currentProject?.files || []}
                selectedFile={selectedFile}
              />
            </div>
          )}
        </div>

        {/* Desktop Preview Panel */}
        {!isMobile && (
          <PreviewPanel
            files={currentProject?.files || []}
            selectedFile={selectedFile}
          />
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <BottomNavigation
          activeView={mobileView}
          onViewChange={handleMobileViewChange}
        />
      )}

      {/* Mobile Files Panel */}
      <MobileFilesPanel
        isOpen={showMobileFiles}
        files={currentProject?.files || []}
        selectedFileId={selectedFileId}
        onClose={() => setShowMobileFiles(false)}
        onFileSelect={(fileId) => {
          handleFileSelect(fileId);
          setShowMobileFiles(false);
          setMobileView('editor');
        }}
        onCreateFile={createFile}
        onCreateFolder={createFolder}
        onDeleteFile={deleteFile}
        onRenameFile={renameFile}
        onImportProject={importProject}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        storageInfo={storageInfo}
        onClearData={clearAllData}
      />
    </div>
  );
}