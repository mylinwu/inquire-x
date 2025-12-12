"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useAppStore } from "@/store";
import { SettingsBasicSection } from "./settings/SettingsBasicSection";
import { SettingsModelSection } from "./settings/SettingsModelSection";
import { SettingsFeatureSection } from "./settings/SettingsFeatureSection";
import { SettingsPromptsSection } from "./settings/SettingsPromptsSection";
import { SettingsImportExport } from "./settings/SettingsImportExport";
import type { Settings } from "@/types";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { settings, updateSettings, resetSettings } = useAppStore();
  const [localSettings, setLocalSettings] = useState<Settings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  const handleReset = () => {
    if (confirm("确定要重置所有设置吗？")) {
      resetSettings();
      setLocalSettings(useAppStore.getState().settings);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* 遮罩 */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* 弹框 */}
      <div className="relative bg-background/95 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-black/5 dark:border-white/5 shrink-0">
          <h2 className="text-lg font-semibold tracking-tight">设置</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <SettingsBasicSection settings={localSettings} onChange={setLocalSettings} />

          <SettingsModelSection settings={localSettings} onChange={setLocalSettings} />

          <div className="h-px bg-black/5 dark:bg-white/5" />

          <SettingsFeatureSection settings={localSettings} onChange={setLocalSettings} />

          <div className="h-px bg-black/5 dark:bg-white/5" />

          <SettingsPromptsSection settings={localSettings} onChange={setLocalSettings} />

          <div className="h-px bg-black/5 dark:bg-white/5" />

          <SettingsImportExport settings={localSettings} onChange={setLocalSettings} />
        </div>

        {/* 底部按钮 */}
        <div className="p-4 px-6 border-t border-black/5 dark:border-white/5 bg-muted/20 shrink-0 flex gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
          >
            重置默认
          </button>
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-foreground/70 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 active:scale-95 rounded-xl transition-all shadow-sm"
          >
            保存更改
          </button>
        </div>
      </div>
    </div>
  );
}
