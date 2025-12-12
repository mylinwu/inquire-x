"use client";

import { useRef } from "react";
import { Download, Upload } from "lucide-react";
import { exportSettingsToJSON, importSettingsFromJSON } from "@/lib/settingsIO";
import type { Settings } from "@/types";

interface SettingsImportExportProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
}

export function SettingsImportExport({ settings, onChange }: SettingsImportExportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      exportSettingsToJSON(settings);
    } catch (error) {
      alert(`导出失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedSettings = await importSettingsFromJSON(file);
      onChange(importedSettings);
      alert("设置导入成功！");
    } catch (error) {
      alert(`导入失败: ${error instanceof Error ? error.message : "未知错误"}`);
    } finally {
      // 重置 input，允许重复选择同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <section className="space-y-3">
      <label className="text-sm font-medium text-foreground/80">数据管理</label>
      <div className="flex gap-2">
        <button
          onClick={handleExport}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground/80 rounded-xl transition-colors text-sm font-medium"
        >
          <Download size={16} />
          导出设置
        </button>
        <button
          onClick={handleImportClick}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground/80 rounded-xl transition-colors text-sm font-medium"
        >
          <Upload size={16} />
          导入设置
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
          aria-label="导入设置文件"
        />
      </div>
      <p className="text-[11px] text-muted-foreground px-1">
        导出当前设置为 JSON 文件，或从已有的 JSON 文件恢复设置
      </p>
    </section>
  );
}
