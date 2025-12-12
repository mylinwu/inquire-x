"use client";

import { useState, useEffect } from "react";
import { Search, Check, ChevronDown, RefreshCw } from "lucide-react";
import type { Settings, OpenRouterModel } from "@/types";

interface SettingsModelSectionProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
}

export function SettingsModelSection({ settings, onChange }: SettingsModelSectionProps) {
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [modelSearch, setModelSearch] = useState("");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const fetchModels = async () => {
    if (!settings.apiKey) return;
    
    setIsLoadingModels(true);
    try {
      const res = await fetch(`/api/models?apiKey=${encodeURIComponent(settings.apiKey)}`);
      if (res.ok) {
        const data = await res.json();
        setModels(data.models || []);
      }
    } catch {
      console.error("获取模型列表失败");
    } finally {
      setIsLoadingModels(false);
    }
  };

  useEffect(() => {
    if (settings.apiKey) {
      fetchModels();
    }
  }, [settings.apiKey]);

  const filteredModels = models.filter(
    (m) =>
      m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
      m.id.toLowerCase().includes(modelSearch.toLowerCase())
  );

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground/80">AI 模型</label>
        <button 
          onClick={fetchModels}
          disabled={!settings.apiKey || isLoadingModels}
          className="text-[11px] flex items-center gap-1 text-primary hover:text-primary/80 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={12} className={isLoadingModels ? "animate-spin" : ""} />
          刷新列表
        </button>
      </div>
      <div className="relative">
        <button
          onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
          className="w-full px-4 py-2.5 bg-black/5 dark:bg-white/5 border border-transparent hover:bg-black/10 dark:hover:bg-white/10 rounded-xl text-left flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
        >
          <span className="truncate font-medium">
            {models.find((m) => m.id === settings.model)?.name || settings.model}
          </span>
          <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-200 ${isModelDropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {isModelDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-black/5 dark:border-white/10 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="p-2 border-b border-black/5 dark:border-white/5 bg-muted/30">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                  placeholder="搜索模型..."
                  className="w-full pl-9 pr-3 py-2 bg-background border border-transparent rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  autoFocus
                />
              </div>
            </div>

            <div className="overflow-y-auto max-h-[240px] p-1">
              {isLoadingModels ? (
                <p className="text-center text-muted-foreground text-xs py-6">加载中...</p>
              ) : filteredModels.length === 0 ? (
                <p className="text-center text-muted-foreground text-xs py-6">
                  {settings.apiKey ? "未找到模型" : "请先输入 API Key"}
                </p>
              ) : (
                filteredModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      onChange({ ...settings, model: model.id });
                      setIsModelDropdownOpen(false);
                      setModelSearch("");
                    }}
                    className="w-full px-3 py-2.5 text-left hover:bg-black/5 dark:hover:bg-white/5 rounded-lg flex items-center justify-between group transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-medium text-sm truncate text-foreground/90 group-hover:text-foreground">{model.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate font-mono mt-0.5">{model.id}</p>
                    </div>
                    {settings.model === model.id && (
                      <Check size={16} className="text-primary flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
