"use client";

import { useCallback } from "react";
import { useAppStore, useCurrentConversation } from "@/store";
import { useChat } from "@/hooks/useChat";
import { Navbar } from "@/components/Navbar";
import { MenuPanel } from "@/components/MenuPanel";
import { SettingsDialog } from "@/components/SettingsDialog";
import { ChatList } from "@/components/ChatList";
import { ChatInput } from "@/components/ChatInput";
import { RecommendedQuestions } from "@/components/RecommendedQuestions";

export default function Home() {
  const {
    isMenuOpen,
    isSettingsOpen,
    setMenuOpen,
    setSettingsOpen,
    createConversation,
    setCurrentConversation,
  } = useAppStore();

  const conversation = useCurrentConversation();
  const { sendMessage, isStreaming, error } = useChat();

  const handleNewChat = useCallback(() => {
    setCurrentConversation(null);
  }, [setCurrentConversation]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      await sendMessage(content);
    },
    [sendMessage]
  );

  const handleSelectQuestion = useCallback(
    async (question: string) => {
      await sendMessage(question);
    },
    [sendMessage]
  );

  const handleFollowUpClick = useCallback(
    async (question: string) => {
      await sendMessage(question);
    },
    [sendMessage]
  );

  const handleOpenSettings = useCallback(() => {
    setMenuOpen(false);
    setSettingsOpen(true);
  }, [setMenuOpen, setSettingsOpen]);

  const showEmptyState = !conversation || conversation.messages.length === 0;

  return (
    <div className="flex flex-col h-screen">
      <Navbar
        onMenuClick={() => setMenuOpen(true)}
        onNewChat={handleNewChat}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {showEmptyState ? (
          <RecommendedQuestions onSelect={handleSelectQuestion} />
        ) : (
          <ChatList
            messages={conversation.messages}
            isStreaming={isStreaming}
            onFollowUpClick={handleFollowUpClick}
          />
        )}

        {error && (
          <div className="px-4 py-2 bg-red-50 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <ChatInput
          onSend={handleSendMessage}
          disabled={isStreaming}
          placeholder={showEmptyState ? "或者，直接输入你的问题..." : "继续对话..."}
        />
      </main>

      <MenuPanel
        isOpen={isMenuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenSettings={handleOpenSettings}
      />

      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
