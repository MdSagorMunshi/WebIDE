import { useEffect, useRef, useState } from 'react';
import { FileUtils } from '@/lib/fileUtils';
import { EditorSettings } from '@/types/ide';

interface MonacoEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
  settings: EditorSettings;
  readOnly?: boolean;
}

declare global {
  interface Window {
    require: any;
    monaco: any;
  }
}

export function MonacoEditor({ value, language, onChange, settings, readOnly = false }: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<any>(null);
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

      const editorInstance = window.monaco.editor.create(editorRef.current, {
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
      });

      // Handle content changes
      editorInstance.onDidChangeModelContent(() => {
        const newValue = editorInstance.getValue();
        onChange(newValue);
      });

      setEditor(editorInstance);
      setIsLoading(false);
    };

    loadMonaco();

    return () => {
      if (editor) {
        editor.dispose();
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
    if (editorRef.current) {
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
      if (editorRef.current && (settings.editorTheme === 'vs-light' || settings.editorTheme === 'vs-dark')) {
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
      <div
        ref={editorRef}
        className="w-full h-full"
        data-testid="monaco-editor"
      />
    </div>
  );
}