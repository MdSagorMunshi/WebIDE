import { useEffect, useRef, useState } from 'react';
import { FileItem } from '@/types/ide';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  RefreshCw,
  ExternalLink,
  Eye,
  Code,
  Image as ImageIcon,
  FileText
} from 'lucide-react';

interface PreviewPanelProps {
  files: FileItem[];
  selectedFile: FileItem | null;
}

export function PreviewPanel({ files, selectedFile }: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [previewType, setPreviewType] = useState<'html' | 'markdown' | 'json' | 'image' | 'text'>('html');

  useEffect(() => {
    generatePreview();
  }, [files, selectedFile]);

  const generatePreview = () => {
    if (!selectedFile) {
      setPreviewContent('');
      return;
    }

    const extension = selectedFile.name.split('.').pop()?.toLowerCase() || '';

    // Handle different file types
    switch (extension) {
      case 'html':
      case 'htm':
        generateHTMLPreview();
        setPreviewType('html');
        break;
      case 'md':
      case 'markdown':
        generateMarkdownPreview();
        setPreviewType('markdown');
        break;
      case 'json':
        generateJSONPreview();
        setPreviewType('json');
        break;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        generateImagePreview();
        setPreviewType('image');
        break;
      default:
        generateTextPreview();
        setPreviewType('text');
        break;
    }
  };

  const generateHTMLPreview = () => {
    // Find HTML file
    const htmlFile = selectedFile?.name.endsWith('.html') ? selectedFile : 
                    files.find(f => f.name === 'index.html' && f.type === 'file');
    
    if (!htmlFile || !htmlFile.content) {
      setPreviewContent('<div style="padding: 20px; text-align: center; color: #666;">No HTML content to preview</div>');
      return;
    }

    let html = htmlFile.content;

    // Replace relative CSS links
    html = html.replace(/<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi, (match, href) => {
      const cssFile = findFileByName(href);
      if (cssFile && cssFile.content) {
        return `<style>${cssFile.content}</style>`;
      }
      return match;
    });

    // Replace relative JS links
    html = html.replace(/<script[^>]+src=["']([^"']+\.js)["'][^>]*><\/script>/gi, (match, src) => {
      const jsFile = findFileByName(src);
      if (jsFile && jsFile.content) {
        return `<script>${jsFile.content}</script>`;
      }
      return match;
    });

    setPreviewContent(html);
  };

  const generateMarkdownPreview = () => {
    if (!selectedFile?.content) {
      setPreviewContent('<div style="padding: 20px;">No markdown content to preview</div>');
      return;
    }

    // Simple markdown to HTML conversion
    let html = selectedFile.content
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/`(.*?)`/gim, '<code>$1</code>')
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/\n/gim, '<br>');

    html = `
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        line-height: 1.6;
        padding: 20px;
        max-width: 800px;
        margin: 0 auto;
      ">
        ${html}
      </div>
    `;

    setPreviewContent(html);
  };

  const generateJSONPreview = () => {
    if (!selectedFile?.content) {
      setPreviewContent('<div style="padding: 20px;">No JSON content to preview</div>');
      return;
    }

    try {
      const parsed = JSON.parse(selectedFile.content);
      const formatted = JSON.stringify(parsed, null, 2);
      
      const html = `
        <div style="
          font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
          padding: 20px;
          background: #f8f9fa;
          margin: 0;
          overflow-x: auto;
        ">
          <pre style="margin: 0; white-space: pre-wrap;">${formatted}</pre>
        </div>
      `;
      
      setPreviewContent(html);
    } catch (error) {
      setPreviewContent(`
        <div style="padding: 20px; color: #d73a49;">
          <h3>JSON Parse Error</h3>
          <p>${(error as Error).message}</p>
        </div>
      `);
    }
  };

  const generateImagePreview = () => {
    if (!selectedFile?.content) {
      setPreviewContent('<div style="padding: 20px;">No image content to preview</div>');
      return;
    }

    // For SVG files, display content directly
    if (selectedFile.name.endsWith('.svg')) {
      setPreviewContent(`
        <div style="padding: 20px; text-align: center;">
          ${selectedFile.content}
        </div>
      `);
    } else {
      setPreviewContent(`
        <div style="padding: 20px; text-align: center;">
          <p>Image preview not available for binary files</p>
          <p>File: ${selectedFile.name}</p>
        </div>
      `);
    }
  };

  const generateTextPreview = () => {
    if (!selectedFile?.content) {
      setPreviewContent('<div style="padding: 20px;">No content to preview</div>');
      return;
    }

    const html = `
      <div style="
        font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
        padding: 20px;
        white-space: pre-wrap;
        line-height: 1.5;
      ">
        ${selectedFile.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </div>
    `;

    setPreviewContent(html);
  };

  const findFileByName = (filename: string): FileItem | undefined => {
    const findInFiles = (fileList: FileItem[]): FileItem | undefined => {
      for (const file of fileList) {
        if (file.name === filename && file.type === 'file') {
          return file;
        }
        if (file.children) {
          const found = findInFiles(file.children);
          if (found) return found;
        }
      }
      return undefined;
    };

    return findInFiles(files);
  };

  const refreshPreview = () => {
    generatePreview();
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.location.reload();
    }
  };

  const openInNewWindow = () => {
    if (previewContent) {
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(previewContent);
        newWindow.document.close();
      }
    }
  };

  const getPreviewIcon = () => {
    switch (previewType) {
      case 'html': return <Code size={16} />;
      case 'markdown': return <FileText size={16} />;
      case 'json': return <Code size={16} />;
      case 'image': return <ImageIcon size={16} />;
      default: return <FileText size={16} />;
    }
  };

  return (
    <div className="w-96 bg-card border-l border-border flex-col hidden lg:flex" data-testid="preview-panel">
      {/* Preview Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center space-x-2">
          {getPreviewIcon()}
          <h2 className="font-medium text-sm">Preview</h2>
        </div>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6"
            onClick={refreshPreview}
            title="Refresh"
            data-testid="button-refresh-preview"
          >
            <RefreshCw size={12} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6"
            onClick={openInNewWindow}
            title="Open in New Window"
            data-testid="button-open-preview"
          >
            <ExternalLink size={12} />
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 bg-white" data-testid="preview-content">
        {selectedFile ? (
          <iframe
            ref={iframeRef}
            srcDoc={previewContent}
            className="w-full h-full border-0"
            title="Preview"
            sandbox="allow-scripts allow-same-origin"
            data-testid="preview-iframe"
          />
        ) : (
          <div className="p-4 h-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select a file to preview</p>
              <p className="text-xs text-gray-400 mt-2">
                HTML, Markdown, JSON, and text files supported
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
