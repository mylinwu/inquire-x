"use client";

import { useMemo, useEffect, useState, useRef } from "react";
import { renderStreamingMarkdown } from "@/lib/markdown";
import { highlightCode } from "@/lib/highlighter";
import { useSettings } from "@/store";
import type { ThinkingPhase } from "@/types";

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

export function MarkdownRenderer({ content, isStreaming: _isStreaming = false }: MarkdownRendererProps) {
  const settings = useSettings();
  const [highlightedHtml, setHighlightedHtml] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  const { html } = useMemo(() => {
    return renderStreamingMarkdown(content, settings.markdownSafetyLevel);
  }, [content, settings.markdownSafetyLevel]);

  useEffect(() => {
    let cancelled = false;

    const processCodeBlocks = async () => {
      if (!containerRef.current) return;

      const codeBlocks = containerRef.current.querySelectorAll("pre code");

      // 简单情况：没有代码块，直接使用
      if (codeBlocks.length === 0) {
        if (!cancelled) {
          setHighlightedHtml(html);
        }
        return;
      }

      // 有代码块：异步高亮
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;

      const codeElements = tempDiv.querySelectorAll("pre code");
      
      for (const codeEl of codeElements) {
        const langClass = Array.from(codeEl.classList).find((c) =>
          c.startsWith("language-")
        );
        const lang = langClass ? langClass.replace("language-", "") : "plaintext";
        const code = codeEl.textContent || "";

        try {
          const highlighted = await highlightCode(code, lang);
          const wrapper = document.createElement("div");
          wrapper.innerHTML = highlighted;
          const newPre = wrapper.querySelector("pre");
          if (newPre && codeEl.parentElement) {
            codeEl.parentElement.replaceWith(newPre);
          }
        } catch {
          // 高亮失败保持原样
        }
      }

      if (!cancelled) {
        setHighlightedHtml(tempDiv.innerHTML);
      }
    };

    processCodeBlocks();

    return () => {
      cancelled = true;
    };
  }, [html]);

  return (
    <div
      ref={containerRef}
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: highlightedHtml || html }}
    />
  );
}

// 流式光标组件
export function StreamingCursor() {
  return <span className="streaming-cursor" />;
}

// 状态指示器
interface ThinkingIndicatorProps {
  phase: ThinkingPhase | null;
}

const PHASE_LABELS: Record<string, string> = {
  thinking: "思考中",
  questioning: "自我质疑中",
  polishing: "打磨中",
};

export function ThinkingIndicator({ phase }: ThinkingIndicatorProps) {
  if (!phase || phase === "complete") return null;

  return (
    <div className="flex items-center gap-2.5 text-[13px] text-muted-foreground/80 mb-2 px-1 select-none">
      <div className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
      </div>
      <span className="font-medium tracking-wide">{PHASE_LABELS[phase as keyof typeof PHASE_LABELS] || "处理中"}...</span>
    </div>
  );
}
