"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "输入消息...",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整高度
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 150);
      textarea.style.height = `${newHeight}px`;
    }
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setValue("");
      // 重置高度
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full bg-background/80 backdrop-blur-md border-t border-black/5 dark:border-white/5 pb-4 pt-2 safe-area-bottom">
      <div className="max-w-4xl mx-auto px-4">
        <div className="relative flex items-end gap-2 bg-input rounded-2xl p-2 shadow-sm border border-black/5 dark:border-white/5 focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-all">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="flex-1 max-h-[150px] min-h-[24px] bg-transparent border-none resize-none px-2 py-1.5 text-[15px] focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={disabled || !value.trim()}
            className="flex-shrink-0 w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-30 disabled:bg-muted disabled:text-muted-foreground active:scale-95 mb-0.5"
          >
            <ArrowUp size={18} strokeWidth={2.5} />
          </button>
        </div>
        <div className="text-center mt-2">
            <p className="text-[10px] text-muted-foreground/40">AI 内容由模型生成，请仔细甄别</p>
        </div>
      </div>
    </div>
  );
}
