"use client";

import { useRef, useEffect, useState } from "react";
import { ChatMessage } from "./ChatMessage";
import type { Message } from "@/types";

interface ChatListProps {
  messages: Message[];
  isStreaming?: boolean;
  onFollowUpClick?: (question: string) => void;
}

export function ChatList({ messages, isStreaming, onFollowUpClick }: ChatListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // 检测滚动位置是否在底部
  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px 的容差
    setIsAtBottom(atBottom);
  };

  // 仅在滚动条在底部时自动滚动
  useEffect(() => {
    if (isAtBottom && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming, isAtBottom]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth"
      onScroll={handleScroll}
    >
      <div className="mx-auto space-y-6">
        {messages.map((message, index) => (
          <ChatMessage
            key={message.id}
            message={message}
            isStreaming={isStreaming && index === messages.length - 1 && message.role === "assistant"}
            onFollowUpClick={onFollowUpClick}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
