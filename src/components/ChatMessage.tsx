"use client";

import type { Message } from "@/types";
import { MarkdownRenderer, ThinkingIndicator, StreamingCursor } from "./MarkdownRenderer";
import { User, Sparkles } from "lucide-react";

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  onFollowUpClick?: (question: string) => void;
}

export function ChatMessage({ message, isStreaming, onFollowUpClick }: ChatMessageProps) {
  const isUser = message.role === "user";
  const showThinking = !isUser && message.thinkingPhase && message.thinkingPhase !== "complete";

  return (
    <div className={`flex w-full mb-6 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[95%] md:max-w-[85%] gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {/* 消息体 */}
        <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
          <div
            className={`relative px-4 py-3 shadow-sm ${
              isUser
                ? "bg-bubble-user text-bubble-user-text rounded-2xl rounded-tr-sm"
                : "bg-bubble-ai text-bubble-ai-text rounded-2xl rounded-tl-sm ring-1 ring-black/5 dark:ring-white/10"
            }`}
          >
            {showThinking && (
              <ThinkingIndicator phase={message.thinkingPhase || null} />
            )}

            {isUser ? (
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.content}</p>
            ) : (
              <>
                <MarkdownRenderer content={message.content} isStreaming={isStreaming} />
                {/* {isStreaming && <StreamingCursor />} */}
              </>
            )}
          </div>

          {/* 追问问题 */}
          {!isUser &&
            message.followUpQuestions &&
            message.followUpQuestions.length > 0 &&
            message.thinkingPhase === "complete" && (
              <div className="mt-3 flex flex-wrap gap-2 ml-1">
                {message.followUpQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => onFollowUpClick?.(q)}
                    className="text-left text-xs bg-black/5 dark:bg-white/5 hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 transition-all py-1.5 px-3 rounded-full text-muted-foreground"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
