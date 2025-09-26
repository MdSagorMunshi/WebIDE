import { useEffect, useRef, useState } from 'react';
import { FileUtils } from '@/lib/fileUtils';
import { EditorSettings } from '@/types/ide';

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

declare global {
  interface Window {
    require: any;
    monaco: any;
  }
}

export function MonacoEditor({ 
  value, 
  language, 
  onChange, 
  settings, 
  readOnly = false,
  splitView = false,
  secondaryValue,
  secondaryLanguage,
  onSecondaryChange,
  onFormat
}: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const secondaryEditorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<any>(null);
  const [secondaryEditor, setSecondaryEditor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!editorRef.current) return;

    // Load Monaco Editor
    const loadMonaco = async () => {
      if (window.monaco) {
        initializeEditor();
        return;
      }

      window.require.config({
        paths: { vs: 'https://unpkg.com/monaco-editor@0.45.0/min/vs' }
      });

      window.require(['vs/editor/editor.main'], () => {
        initializeEditor();
      });
    };

    const initializeEditor = () => {
      if (!editorRef.current || !window.monaco) return;

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

      const editorInstance = window.monaco.editor.create(editorRef.current, editorOptions);

      // Handle content changes
      editorInstance.onDidChangeModelContent(() => {
        const newValue = editorInstance.getValue();
        onChange(newValue);
      });

      // Add format action
      if (onFormat) {
        editorInstance.addAction({
          id: 'format-code',
          label: 'Format Code',
          keybindings: [window.monaco.KeyMod.CtrlCmd | window.monaco.KeyMod.Shift | window.monaco.KeyCode.KeyF],
          contextMenuGroupId: '1_modification',
          run: () => {
            onFormat();
          }
        });
      }

      setEditor(editorInstance);

      // Initialize secondary editor for split view
      if (splitView && secondaryEditorRef.current && secondaryValue !== undefined) {
        const secondaryOptions = {
          ...editorOptions,
          value: secondaryValue,
          language: secondaryLanguage ? FileUtils.getLanguageFromExtension(secondaryLanguage) : editorOptions.language
        };

        const secondaryEditorInstance = window.monaco.editor.create(secondaryEditorRef.current, secondaryOptions);

        secondaryEditorInstance.onDidChangeModelContent(() => {
          const newValue = secondaryEditorInstance.getValue();
          onSecondaryChange?.(newValue);
        });

        setSecondaryEditor(secondaryEditorInstance);
      }

      setIsLoading(false);
    };

    loadMonaco();

    return () => {
      if (editor) {
        editor.dispose();
      }
      if (secondaryEditor) {
        secondaryEditor.dispose();
      }
    };
  }, []);

  // Update editor when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getValue()) {
      const position = editor.getPosition();
      editor.setValue(value);
      if (position) {
        editor.setPosition(position);
      }
    }
  }, [editor, value]);

  // Update secondary editor when value changes externally
  useEffect(() => {
    if (secondaryEditor && secondaryValue !== undefined && secondaryValue !== secondaryEditor.getValue()) {
      const position = secondaryEditor.getPosition();
      secondaryEditor.setValue(secondaryValue);
      if (position) {
        secondaryEditor.setPosition(position);
      }
    }
  }, [secondaryEditor, secondaryValue]);

  // Update editor settings
  useEffect(() => {
    if (!editor) return;

    editor.updateOptions({
      theme: settings.editorTheme,
      fontSize: settings.fontSize,
      tabSize: settings.tabSize,
      wordWrap: settings.wordWrap ? 'on' : 'off',
      minimap: { enabled: settings.minimap },
      lineNumbers: settings.lineNumbers ? 'on' : 'off'
    });
  }, [editor, settings]);

  // Update language
  useEffect(() => {
    if (!editor || !window.monaco) return;

    const model = editor.getModel();
    if (model) {
      window.monaco.editor.setModelLanguage(model, FileUtils.getLanguageFromExtension(language));
    }
  }, [editor, language]);

  // Update editor theme when settings change
  useEffect(() => {
    if (editorRef.current && window.monaco?.editor) {
      // Map app theme to editor theme if editorTheme is auto
      let editorTheme = settings.editorTheme;

      if (editorTheme === 'vs-light' || editorTheme === 'vs-dark') {
        // Auto-detect based on system/app theme
        const isDark = document.documentElement.classList.contains('dark');
        editorTheme = isDark ? 'vs-dark' : 'vs-light';
      }

      window.monaco.editor.setTheme(editorTheme);
    }
  }, [settings.editorTheme]);

  // Also update theme when document theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (editorRef.current && window.monaco?.editor && (settings.editorTheme === 'vs-light' || settings.editorTheme === 'vs-dark')) {
        const isDark = document.documentElement.classList.contains('dark');
        const theme = isDark ? 'vs-dark' : 'vs-light';
        window.monaco.editor.setTheme(theme);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, [settings.editorTheme]);

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card" data-testid="editor-loading">
          <div className="text-muted-foreground">Loading editor...</div>
        </div>
      )}
      {splitView ? (
        <div className="flex w-full h-full">
          <div
            ref={editorRef}
            className="w-1/2 h-full border-r border-border"
            data-testid="monaco-editor-primary"
          />
          <div
            ref={secondaryEditorRef}
            className="w-1/2 h-full"
            data-testid="monaco-editor-secondary"
          />
        </div>
      ) : (
        <div
          ref={editorRef}
          className="w-full h-full"
          data-testid="monaco-editor"
        />
      )}
    </div>
  );
}