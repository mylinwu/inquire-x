"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { useSettings } from "@/store";
import { STORAGE_KEYS } from "@/config";

interface RecommendedQuestionsProps {
  onSelect: (question: string) => void;
}

// 从缓存初始化 AI 问题
function getInitialAiQuestions(): string[] {
  if (typeof window === "undefined") return [];
  const cached = localStorage.getItem(STORAGE_KEYS.aiQuestions);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      return [];
    }
  }
  return [];
}

export function RecommendedQuestions({ onSelect }: RecommendedQuestionsProps) {
  const settings = useSettings();
  const [aiQuestions, setAiQuestions] = useState<string[]>(getInitialAiQuestions);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cacheChecked, setCacheChecked] = useState(false);

  // 组件挂载时检查缓存状态
  useEffect(() => {
    if (settings.enableAIGeneratedQuestions) {
      const cached = localStorage.getItem(STORAGE_KEYS.aiQuestions);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setAiQuestions(parsed);
        } catch {
          // 缓存解析失败，忽略
        }
      }
    }
    setCacheChecked(true);
  }, [settings.enableAIGeneratedQuestions]);

  // 生成 AI 问题
  const generateQuestions = useCallback(async () => {
    if (!settings.apiKey || isGenerating) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: settings.apiKey,
          model: settings.model,
          referenceQuestions: settings.recommendedQuestions.map((q) => q.trim()).filter(Boolean),
        }),
      });

      if (response.ok) {
        const { questions } = await response.json();
        if (questions && questions.length > 0) {
          setAiQuestions(questions);
          localStorage.setItem(STORAGE_KEYS.aiQuestions, JSON.stringify(questions));
        }
      }
    } catch {
      // 生成失败，使用默认问题
    } finally {
      setIsGenerating(false);
    }
  }, [settings.apiKey, settings.model, settings.recommendedQuestions, isGenerating]);

  // 自动生成问题（仅在开启 AI 生成、缓存检查完成且没有缓存时才生成）
  useEffect(() => {
    if (settings.enableAIGeneratedQuestions && cacheChecked && aiQuestions.length === 0 && settings.apiKey && !isGenerating) {
      generateQuestions();
    }
  }, [settings.enableAIGeneratedQuestions, cacheChecked, aiQuestions.length, settings.apiKey, isGenerating, generateQuestions]);

  // 决定显示哪些问题
  const displayQuestions = settings.enableAIGeneratedQuestions
    ? (aiQuestions.length > 0 ? aiQuestions : [])
    : settings.recommendedQuestions;

  const showLoading = settings.enableAIGeneratedQuestions && isGenerating && aiQuestions.length === 0;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="min-h-full flex flex-col items-center justify-center px-4 py-10">
        <div className="mb-10 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center rotate-3 transform transition-transform hover:rotate-6">
            <Sparkles size={32} className="text-primary" />
          </div>
          <h2 className="text-2xl font-semibold mb-3 tracking-tight">开始新对话</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            选择一个启发性问题，或直接在下方输入你的想法。
          </p>
        </div>

        {/* 刷新按钮 */}
        {settings.enableAIGeneratedQuestions && aiQuestions.length > 0 && !isGenerating && (
          <div className="w-full flex justify-end mb-3">
            <button
              onClick={generateQuestions}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
              title="重新生成问题"
            >
              <RefreshCw size={12} />
              <span>换一批</span>
            </button>
          </div>
        )}

        {showLoading ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <Loader2 size={24} className="text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">正在生成问题...</p>
          </div>
        ) : (
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => onSelect(question)}
                className="group relative text-left p-5 rounded-xl bg-card hover:bg-accent/50 border border-black/5 dark:border-white/5 hover:border-primary/20 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-auto"
              >
                <p className="text-sm text-foreground/80 group-hover:text-foreground leading-relaxed">
                  {question}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* 正在刷新时显示加载指示器 */}
        {settings.enableAIGeneratedQuestions && isGenerating && aiQuestions.length > 0 && (
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 size={12} className="animate-spin" />
            <span>正在生成新问题...</span>
          </div>
        )}
      </div>
    </div>
  );
}
