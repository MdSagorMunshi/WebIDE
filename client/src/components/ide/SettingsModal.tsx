import { EditorSettings } from '@/types/ide';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { FileUtils } from '@/lib/fileUtils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  X,
  Trash2
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EditorSettings;
  onUpdateSettings: (settings: Partial<EditorSettings>) => void;
  storageInfo: { used: number; available: number };
  onClearData: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  storageInfo,
  onClearData
}: SettingsModalProps) {
  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      onClearData();
      onClose();
    }
  };

  const storageUsedPercent = storageInfo.available > 0 
    ? (storageInfo.used / storageInfo.available) * 100 
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden" data-testid="settings-modal">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your IDE preferences and manage storage
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)] space-y-6 pr-2">
          {/* Appearance Settings */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Appearance</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-select" className="text-sm font-medium">
                Theme
              </Label>
              <Select
                value={settings.theme}
                onValueChange={(value: 'light' | 'dark' | 'system') => 
                  onUpdateSettings({ theme: value })
                }
              >
                <SelectTrigger className="w-32" id="theme-select" data-testid="select-theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Editor Settings */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Editor</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="font-size-select" className="text-sm font-medium">
                Font Size
              </Label>
              <Select
                value={settings.fontSize.toString()}
                onValueChange={(value) => onUpdateSettings({ fontSize: parseInt(value) })}
              >
                <SelectTrigger className="w-20" id="font-size-select" data-testid="select-font-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12px</SelectItem>
                  <SelectItem value="14">14px</SelectItem>
                  <SelectItem value="16">16px</SelectItem>
                  <SelectItem value="18">18px</SelectItem>
                  <SelectItem value="20">20px</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="tab-size-select" className="text-sm font-medium">
                Tab Size
              </Label>
              <Select
                value={settings.tabSize.toString()}
                onValueChange={(value) => onUpdateSettings({ tabSize: parseInt(value) })}
              >
                <SelectTrigger className="w-24" id="tab-size-select" data-testid="select-tab-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 spaces</SelectItem>
                  <SelectItem value="4">4 spaces</SelectItem>
                  <SelectItem value="8">8 spaces</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="editor-theme-select" className="text-sm font-medium">
                Editor Theme
              </Label>
              <Select
                value={settings.editorTheme}
                onValueChange={(value) => onUpdateSettings({ editorTheme: value })}
              >
                <SelectTrigger className="w-36" id="editor-theme-select" data-testid="select-editor-theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vs-light">Auto Light</SelectItem>
                  <SelectItem value="vs-dark">Auto Dark</SelectItem>
                  <SelectItem value="hc-black">High Contrast</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="auto-save-switch" className="text-sm font-medium">
                Auto Save
              </Label>
              <Switch
                id="auto-save-switch"
                checked={settings.autoSave}
                onCheckedChange={(checked) => onUpdateSettings({ autoSave: checked })}
                data-testid="switch-auto-save"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="word-wrap-switch" className="text-sm font-medium">
                Word Wrap
              </Label>
              <Switch
                id="word-wrap-switch"
                checked={settings.wordWrap}
                onCheckedChange={(checked) => onUpdateSettings({ wordWrap: checked })}
                data-testid="switch-word-wrap"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="minimap-switch" className="text-sm font-medium">
                Minimap
              </Label>
              <Switch
                id="minimap-switch"
                checked={settings.minimap}
                onCheckedChange={(checked) => onUpdateSettings({ minimap: checked })}
                data-testid="switch-minimap"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="line-numbers-switch" className="text-sm font-medium">
                Line Numbers
              </Label>
              <Switch
                id="line-numbers-switch"
                checked={settings.lineNumbers}
                onCheckedChange={(checked) => onUpdateSettings({ lineNumbers: checked })}
                data-testid="switch-line-numbers"
              />
            </div>
          </div>

          <Separator />

          {/* Storage Settings */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Storage</h3>
            
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="text-sm text-muted-foreground">Storage Usage</div>
              
              <div className="flex items-center justify-between text-sm">
                <span>
                  Used: <span className="font-medium" data-testid="storage-used">
                    {FileUtils.formatFileSize(storageInfo.used)}
                  </span>
                </span>
                <span>
                  Available: <span className="font-medium" data-testid="storage-available">
                    {FileUtils.formatFileSize(storageInfo.available)}
                  </span>
                </span>
              </div>
              
              <div className="space-y-2">
                <Progress 
                  value={storageUsedPercent} 
                  className="h-2" 
                  data-testid="storage-progress"
                />
                <div className="text-xs text-muted-foreground text-center">
                  {storageUsedPercent.toFixed(1)}% used
                </div>
              </div>
            </div>

            <Button
              variant="destructive"
              onClick={handleClearData}
              className="w-full"
              data-testid="button-clear-data"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Data
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
