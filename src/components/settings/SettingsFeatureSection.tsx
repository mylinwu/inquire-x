"use client";

import type { Settings } from "@/types";

interface SettingsFeatureSectionProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
}

export function SettingsFeatureSection({ settings, onChange }: SettingsFeatureSectionProps) {
  return (
    <>
      {/* 三段式开关 */}
      <section>
        <label className="flex items-center justify-between cursor-pointer group">
          <div className="space-y-0.5">
            <span className="text-sm font-medium text-foreground/90">三段式思考流程</span>
            <p className="text-[11px] text-muted-foreground">AI 将进行"思考 → 质疑 → 打磨"的深度推理</p>
          </div>
          <div
            className={`w-11 h-6 rounded-full transition-colors relative duration-200 ${
              settings.enableThreePhase ? "bg-primary" : "bg-black/10 dark:bg-white/10 group-hover:bg-black/20 dark:group-hover:bg-white/20"
            }`}
            onClick={(e) => {
              e.preventDefault();
              onChange({
                ...settings,
                enableThreePhase: !settings.enableThreePhase,
              });
            }}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                settings.enableThreePhase ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>
        </label>
      </section>

      {/* 选项组 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* 流式速度 */}
        <section className="space-y-3">
          <label className="text-sm font-medium text-foreground/80">流式速度</label>
          <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl">
            {(["slow", "medium", "fast"] as const).map((speed) => (
              <button
                key={speed}
                onClick={() => onChange({ ...settings, streamSpeed: speed })}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  settings.streamSpeed === speed
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {{ slow: "慢", medium: "中", fast: "快" }[speed]}
              </button>
            ))}
          </div>
        </section>

        {/* 安全等级 */}
        <section className="space-y-3">
          <label className="text-sm font-medium text-foreground/80">Markdown 安全</label>
          <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl">
            {(["strict", "normal", "loose"] as const).map((level) => (
              <button
                key={level}
                onClick={() =>
                  onChange({ ...settings, markdownSafetyLevel: level })
                }
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  settings.markdownSafetyLevel === level
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {{ strict: "严格", normal: "正常", loose: "宽松" }[level]}
              </button>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
