import { useState, useEffect, useCallback } from 'react';
import { EditorSettings } from '@/types/ide';
import { storage } from '@/lib/storage';

export function useSettings() {
  const [settings, setSettings] = useState<EditorSettings>({
    theme: 'system',
    fontSize: 14,
    tabSize: 2,
    editorTheme: 'vs-light',
    autoSave: true,
    wordWrap: false,
    minimap: true,
    lineNumbers: true
  });

  const [storageInfo, setStorageInfo] = useState({ used: 0, available: 0 });

  useEffect(() => {
    loadSettings();
    updateStorageInfo();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await storage.getSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const updateStorageInfo = async () => {
    try {
      const info = await storage.getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error('Failed to get storage info:', error);
    }
  };

  const updateSettings = useCallback(async (newSettings: Partial<EditorSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    try {
      await storage.saveSettings(updatedSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [settings]);

  const clearAllData = useCallback(async () => {
    try {
      await storage.clearAllData();
      setSettings({
        theme: 'system',
        fontSize: 14,
        tabSize: 2,
        editorTheme: 'vs-light',
        autoSave: true,
        wordWrap: false,
        minimap: true,
        lineNumbers: true
      });
      await updateStorageInfo();
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }, []);

  return {
    settings,
    storageInfo,
    updateSettings,
    clearAllData,
    updateStorageInfo
  };
}
