"use client";

import type { Settings } from "@/types";

interface SettingsPromptsSectionProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
}

export function SettingsPromptsSection({ settings, onChange }: SettingsPromptsSectionProps) {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground/80">AI 人设提示词</label>
        <textarea
          value={settings.systemPrompt}
          onChange={(e) =>
            onChange({ ...settings, systemPrompt: e.target.value })
          }
          rows={4}
          placeholder="定义 AI 的行为和角色..."
          className="w-full px-4 py-3 bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm resize-none leading-relaxed"
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground/80">追问生成提示词</label>
        <textarea
          value={settings.followUpPrompt}
          onChange={(e) =>
            onChange({ ...settings, followUpPrompt: e.target.value })
          }
          rows={3}
          placeholder="定义如何生成追问..."
          className="w-full px-4 py-3 bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm resize-none leading-relaxed"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground/80">
            {settings.enableAIGeneratedQuestions ? "参考问题风格 (每行一个)" : "推荐问题 (每行一个)"}
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-muted-foreground">AI 生成</span>
            <input
              type="checkbox"
              checked={settings.enableAIGeneratedQuestions}
              onChange={(e) =>
                onChange({ ...settings, enableAIGeneratedQuestions: e.target.checked })
              }
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
            />
          </label>
        </div>
        <textarea
          value={settings.recommendedQuestions.join("\n")}
          onChange={(e) =>
            onChange({
              ...settings,
              recommendedQuestions: e.target.value.split("\n"),
            })
          }
          rows={5}
          className="w-full px-4 py-3 bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm resize-none leading-relaxed"
        />
        {settings.enableAIGeneratedQuestions && (
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            开启后，AI 会参考上述问题的风格生成新问题，首页将展示 AI 生成的问题
          </p>
        )}
      </div>
    </section>
  );
}
