"use client";

import type { Settings } from "@/types";

interface SettingsBasicSectionProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
}

export function SettingsBasicSection({ settings, onChange }: SettingsBasicSectionProps) {
  return (
    <>
      {/* 用户名 */}
      <section className="space-y-3">
        <label className="text-sm font-medium text-foreground/80">用户名称</label>
        <div className="space-y-1.5">
          <input
            type="text"
            value={settings.username}
            onChange={(e) => onChange({ ...settings, username: e.target.value })}
            placeholder="输入你的名字"
            className="w-full px-4 py-2.5 bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
          />
          <p className="text-[11px] text-muted-foreground px-1">
            AI 可在对话中通过 {"{username}"} 引用此名称
          </p>
        </div>
      </section>

      {/* API Key */}
      <section className="space-y-3">
        <label className="text-sm font-medium text-foreground/80">OpenRouter API Key</label>
        <div className="space-y-1.5">
          <input
            type="password"
            value={settings.apiKey}
            onChange={(e) => onChange({ ...settings, apiKey: e.target.value })}
            placeholder="sk-or-..."
            className="w-full px-4 py-2.5 bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-mono"
          />
          <p className="text-[11px] text-muted-foreground px-1">
            从 <a href="https://openrouter.ai/keys" target="_blank" rel="noopener" className="text-primary hover:underline">openrouter.ai</a> 获取密钥
          </p>
        </div>
      </section>
    </>
  );
}
