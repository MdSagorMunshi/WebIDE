import { Button } from '@/components/ui/button';
import {
  Files,
  Code,
  Eye,
  Settings,
  Download
} from 'lucide-react';

interface BottomNavigationProps {
  activeView: 'files' | 'editor' | 'preview' | 'settings' | 'export';
  onViewChange: (view: 'files' | 'editor' | 'preview' | 'settings' | 'export') => void;
}

export function BottomNavigation({ activeView, onViewChange }: BottomNavigationProps) {
  const navItems = [
    { id: 'files' as const, icon: Files, label: 'Files' },
    { id: 'editor' as const, icon: Code, label: 'Editor' },
    { id: 'preview' as const, icon: Eye, label: 'Preview' },
    { id: 'settings' as const, icon: Settings, label: 'Settings' },
    { id: 'export' as const, icon: Download, label: 'Export' }
  ];

  return (
    <div className="md:hidden bg-card border-t border-border" data-testid="bottom-navigation">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ id, icon: Icon, label }) => (
          <Button
            key={id}
            variant="ghost"
            className={`flex flex-col items-center py-2 px-4 h-auto ${
              activeView === id ? 'text-primary' : 'text-muted-foreground'
            }`}
            onClick={() => onViewChange(id)}
            data-testid={`nav-${id}`}
          >
            <Icon size={20} className="mb-1" />
            <span className="text-xs">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
