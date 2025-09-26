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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

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
  Smartphone,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  AlertCircle
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
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const [editingProjectName, setEditingProjectName] = useState('');
  const [splitView, setSplitView] = useState(false);
  const [secondaryTabId, setSecondaryTabId] = useState<string | null>(null);
  const [secondaryContent, setSecondaryContent] = useState('');
  const [warningDialog, setWarningDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'warning' | 'error' | 'info' | 'confirm';
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  // Notification functions
  const showToast = useCallback((
    title: string, 
    description?: string, 
    variant: 'default' | 'destructive' = 'default',
    icon?: React.ReactNode
  ) => {
    toast({
      title: (
        <div className="flex items-center gap-2">
          {icon}
          {title}
        </div>
      ),
      description,
      variant
    });
  }, [toast]);

  const showWarningDialog = useCallback((
    title: string,
    message: string,
    type: 'warning' | 'error' | 'info' | 'confirm' = 'info',
    onConfirm?: () => void,
    onCancel?: () => void
  ) => {
    setWarningDialog({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      onCancel
    });
  }, []);

  const closeWarningDialog = useCallback(() => {
    setWarningDialog(prev => ({ ...prev, isOpen: false }));
  }, []);

  // File operations
  const handleFileSelect = useCallback((fileId: string) => {
    try {
      const file = findFile(currentProject?.files || [], fileId);
      if (!file || file.type !== 'file') {
        showToast('File Error', 'File not found or invalid file type', 'destructive', <XCircle size={16} />);
        return;
      }

      setSelectedFileId(fileId);

      // Check if tab is already open
      const existingTab = openTabs.find(tab => tab.fileId === fileId);
      if (existingTab) {
        setActiveTabId(existingTab.id);
        setEditorContent(existingTab.content);
        showToast('File Opened', `Switched to ${file.name}`, 'default', <FileText size={16} />);
        return;
      }

      // Warn if opening too many tabs
      if (openTabs.length >= 10) {
        showWarningDialog(
          'Too Many Tabs',
          'You have many tabs open. Consider closing some to improve performance.',
          'warning'
        );
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
      showToast('File Opened', `${file.name} opened in new tab`, 'default', <CheckCircle size={16} />);
    } catch (error) {
      showToast('Error', 'Failed to open file', 'destructive', <XCircle size={16} />);
    }
  }, [currentProject?.files, findFile, setSelectedFileId, openTabs, showToast, showWarningDialog]);

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
    if (!activeTabId || !selectedFileId) {
      showToast('Save Error', 'No active file to save', 'destructive', <AlertCircle size={16} />);
      return;
    }

    const tab = openTabs.find(t => t.id === activeTabId);
    if (!tab) {
      showToast('Save Error', 'Active tab not found', 'destructive', <XCircle size={16} />);
      return;
    }

    if (!tab.isDirty) {
      showToast('No Changes', `${tab.title} has no unsaved changes`, 'default', <Info size={16} />);
      return;
    }

    try {
      showToast('Saving...', `Saving ${tab.title}`, 'default', <Info size={16} />);
      
      await updateFileContent(selectedFileId, editorContent);

      // Mark tab as clean
      setOpenTabs(prev => prev.map(t => 
        t.id === activeTabId ? { ...t, content: editorContent, isDirty: false } : t
      ));

      showToast('File Saved', `${tab.title} has been saved successfully`, 'default', <CheckCircle size={16} />);
    } catch (error) {
      console.error('Save error:', error);
      showToast('Save Failed', `Failed to save ${tab.title}. Please try again.`, 'destructive', <XCircle size={16} />);
    }
  }, [activeTabId, selectedFileId, openTabs, editorContent, updateFileContent, showToast]);

  const handleFormatCode = useCallback(async () => {
    if (!activeTabId) return;

    const tab = openTabs.find(t => t.id === activeTabId);
    if (!tab) return;

    try {
      const formattedContent = await FileUtils.formatCode(editorContent, tab.language);
      setEditorContent(formattedContent);
      
      // Mark tab as dirty if content changed
      if (formattedContent !== tab.content) {
        setOpenTabs(prev => prev.map(t => 
          t.id === activeTabId ? { ...t, content: formattedContent, isDirty: true } : t
        ));
      }

      showToast('Code Formatted', `${tab.title} has been formatted`, 'default', <CheckCircle size={16} />);
    } catch (error) {
      console.error('Format error:', error);
      showToast('Format Failed', 'Failed to format code', 'destructive', <XCircle size={16} />);
    }
  }, [activeTabId, openTabs, editorContent, showToast]);


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

  // Project name editing functions
  const handleStartEditingProjectName = () => {
    setEditingProjectName(currentProject?.name || 'My Project');
    setIsEditingProjectName(true);
  };

  const handleSaveProjectName = async () => {
    if (!editingProjectName.trim()) {
      showToast('Invalid Name', 'Project name cannot be empty', 'destructive', <AlertCircle size={16} />);
      return;
    }

    if (!currentProject) {
      showToast('Error', 'No active project to rename', 'destructive', <XCircle size={16} />);
      setIsEditingProjectName(false);
      return;
    }

    if (editingProjectName.trim() === currentProject.name) {
      showToast('No Changes', 'Project name unchanged', 'default', <Info size={16} />);
      setIsEditingProjectName(false);
      return;
    }

    try {
      await updateProjectName(editingProjectName.trim());
      
      showToast(
        'Project Renamed', 
        `Successfully renamed to "${editingProjectName.trim()}"`, 
        'default', 
        <CheckCircle size={16} />
      );
    } catch (error) {
      console.error('Rename error:', error);
      showToast('Rename Failed', 'Failed to rename project. Please try again.', 'destructive', <XCircle size={16} />);
    }
    setIsEditingProjectName(false);
  };

  const handleCancelEditingProjectName = () => {
    setIsEditingProjectName(false);
    setEditingProjectName('');
  };

  const handleClearWorkspace = () => {
    showWarningDialog(
      'Clear Workspace',
      'This will delete all files in the current project. This action cannot be undone. Continue?',
      'warning',
      () => {
        clearWorkspace();
        setOpenTabs([]);
        setActiveTabId(null);
        setSelectedFileId(null);
        setEditorContent('');
      }
    );
  };

  const handleToggleSplitView = () => {
    setSplitView(!splitView);
    if (!splitView && openTabs.length > 1) {
      // Set secondary tab to the next available tab
      const nextTab = openTabs.find(tab => tab.id !== activeTabId);
      if (nextTab) {
        setSecondaryTabId(nextTab.id);
        setSecondaryContent(nextTab.content);
      }
    }
  };

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
    const tab = openTabs.find(t => t.id === tabId);
    if (!tab) {
      showToast('Error', 'Tab not found', 'destructive', <XCircle size={16} />);
      return;
    }

    if (tab.isDirty) {
      showWarningDialog(
        'Unsaved Changes',
        `You have unsaved changes in "${tab.title}". Do you want to close without saving?`,
        'warning',
        () => {
          closeTab(tabId);
          showToast('Tab Closed', `${tab.title} closed without saving`, 'default', <AlertTriangle size={16} />);
        }
      );
      return;
    }

    closeTab(tabId);
    showToast('Tab Closed', `${tab.title} closed`, 'default', <Info size={16} />);
  };

  const closeTab = (tabId: string) => {
    const newTabs = openTabs.filter(t => t.id !== tabId);
    setOpenTabs(newTabs);

    if (activeTabId === tabId) {
      const nextTab = newTabs[newTabs.length - 1];
      if (nextTab) {
        setActiveTabId(nextTab.id);
        setEditorContent(nextTab.content);
        setSelectedFileId(nextTab.fileId);
      } else {
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
            <div className="flex items-center space-x-2">
              {isEditingProjectName ? (
                <div className="flex items-center space-x-2">
                  <Input
                    value={editingProjectName}
                    onChange={(e) => setEditingProjectName(e.target.value)}
                    className="text-sm h-8 w-32"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveProjectName();
                      if (e.key === 'Escape') handleCancelEditingProjectName();
                    }}
                    autoFocus
                    data-testid="input-project-name"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveProjectName}
                    className="h-8 px-2"
                    data-testid="button-save-project-name"
                  >
                    <Save size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEditingProjectName}
                    className="h-8 px-2"
                    data-testid="button-cancel-project-name"
                  >
                    <X size={14} />
                  </Button>
                </div>
              ) : (
                <div 
                  className="text-sm text-muted-foreground hover:text-foreground cursor-pointer px-2 py-1 rounded hover:bg-muted transition-colors"
                  onClick={handleStartEditingProjectName}
                  data-testid="project-name-display"
                >
                  {currentProject?.name || 'My Project'}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';
                setTheme(newTheme);
                updateSettings({ theme: newTheme });
                showToast('Theme Changed', `Switched to ${newTheme} theme`, 'default', <Sun size={16} />);
              }}
              data-testid="button-toggle-theme"
              title={`Current: ${theme} theme`}
            >
              {theme === 'dark' ? <Sun size={16} /> : theme === 'light' ? <Moon size={16} /> : <Smartphone size={16} />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowSettings(true);
                showToast('Settings', 'Settings panel opened', 'default', <Settings size={16} />);
              }}
              data-testid="button-open-settings"
              title="Settings"
            >
              <Settings size={16} />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                showWarningDialog(
                  'Create New Project',
                  'This will close the current project. Any unsaved changes will be lost. Continue?',
                  'confirm',
                  () => {
                    createNewProject();
                    showToast('New Project', 'New project created successfully', 'default', <CheckCircle size={16} />);
                  }
                );
              }}
              data-testid="button-new-project"
              title="New Project"
            >
              <Plus size={16} />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleSplitView}
              data-testid="button-toggle-split"
              title={splitView ? "Close Split View" : "Split View"}
            >
              <Columns size={16} />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearWorkspace}
              data-testid="button-clear-workspace"
              title="Clear Workspace"
            >
              <RotateCcw size={16} />
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => {
                try {
                  exportProject();
                  showToast('Export Started', 'Project export initiated', 'default', <Download size={16} />);
                } catch (error) {
                  showToast('Export Failed', 'Failed to export project', 'destructive', <XCircle size={16} />);
                }
              }}
              data-testid="button-export-project"
              title="Export Project"
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
            onDuplicateFile={duplicateFile}
            onMoveFile={moveFile}
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
                  onClick={handleFormatCode}
                  title="Format Code (Ctrl+Shift+F)"
                  data-testid="button-format-code"
                >
                  <Code size={12} />
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
                  splitView={splitView}
                  secondaryValue={splitView ? secondaryContent : undefined}
                  secondaryLanguage={splitView && secondaryTabId ? 
                    openTabs.find(t => t.id === secondaryTabId)?.language : undefined}
                  onSecondaryChange={splitView ? setSecondaryContent : undefined}
                  onFormat={handleFormatCode}
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

      {/* Warning/Alert Dialog */}
      <AlertDialog open={warningDialog.isOpen} onOpenChange={closeWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {warningDialog.type === 'warning' && <AlertTriangle className="text-amber-500" size={20} />}
              {warningDialog.type === 'error' && <XCircle className="text-red-500" size={20} />}
              {warningDialog.type === 'info' && <Info className="text-blue-500" size={20} />}
              {warningDialog.type === 'confirm' && <AlertCircle className="text-orange-500" size={20} />}
              {warningDialog.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {warningDialog.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                warningDialog.onCancel?.();
                closeWarningDialog();
              }}
            >
              Cancel
            </AlertDialogCancel>
            {(warningDialog.type === 'warning' || warningDialog.type === 'confirm') && (
              <AlertDialogAction
                onClick={() => {
                  warningDialog.onConfirm?.();
                  closeWarningDialog();
                }}
                className={warningDialog.type === 'warning' ? 'bg-amber-500 hover:bg-amber-600' : undefined}
              >
                {warningDialog.type === 'warning' ? 'Continue Anyway' : 'Confirm'}
              </AlertDialogAction>
            )}
            {warningDialog.type === 'info' && (
              <AlertDialogAction onClick={closeWarningDialog}>
                OK
              </AlertDialogAction>
            )}
            {warningDialog.type === 'error' && (
              <AlertDialogAction onClick={closeWarningDialog} className="bg-red-500 hover:bg-red-600">
                OK
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}