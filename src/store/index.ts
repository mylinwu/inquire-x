import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Conversation, Message, Settings, ThinkingPhase } from "@/types";
import { DEFAULT_SETTINGS, STORAGE_KEYS } from "@/config";

interface AppState {
  // 会话相关
  conversations: Conversation[];
  currentConversationId: string | null;
  
  // UI 状态
  isMenuOpen: boolean;
  isSettingsOpen: boolean;
  
  // 流式输出状态
  isStreaming: boolean;
  currentPhase: ThinkingPhase | null;
  streamingContent: string;
  
  // 设置
  settings: Settings;
  
  // 操作方法
  createConversation: () => string;
  deleteConversation: (id: string) => void;
  setCurrentConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: Omit<Message, "id" | "timestamp">) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  
  setMenuOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  
  setStreaming: (streaming: boolean) => void;
  setCurrentPhase: (phase: ThinkingPhase | null) => void;
  setStreamingContent: (content: string) => void;
  
  updateSettings: (settings: Partial<Settings>) => void;
  resetSettings: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, _get) => ({
      conversations: [],
      currentConversationId: null,
      isMenuOpen: false,
      isSettingsOpen: false,
      isStreaming: false,
      currentPhase: null,
      streamingContent: "",
      settings: DEFAULT_SETTINGS,

      createConversation: () => {
        const id = `conv_${Date.now()}`;
        const newConversation: Conversation = {
          id,
          title: "新对话",
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          currentConversationId: id,
        }));
        return id;
      },

      deleteConversation: (id) => {
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          currentConversationId:
            state.currentConversationId === id ? null : state.currentConversationId,
        }));
      },

      setCurrentConversation: (id) => {
        set({ currentConversationId: id });
      },

      addMessage: (conversationId, message) => {
        const newMessage: Message = {
          ...message,
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        };
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, newMessage],
                  title: conv.messages.length === 0 && message.role === "user" 
                    ? message.content.slice(0, 20) + (message.content.length > 20 ? "..." : "")
                    : conv.title,
                  updatedAt: Date.now(),
                }
              : conv
          ),
        }));
      },

      updateMessage: (conversationId, messageId, updates) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: conv.messages.map((msg) =>
                    msg.id === messageId ? { ...msg, ...updates } : msg
                  ),
                  updatedAt: Date.now(),
                }
              : conv
          ),
        }));
      },

      deleteMessage: (conversationId, messageId) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: conv.messages.filter((msg) => msg.id !== messageId),
                  updatedAt: Date.now(),
                }
              : conv
          ),
        }));
      },

      setMenuOpen: (open) => set({ isMenuOpen: open }),
      setSettingsOpen: (open) => set({ isSettingsOpen: open }),
      setStreaming: (streaming) => set({ isStreaming: streaming }),
      setCurrentPhase: (phase) => set({ currentPhase: phase }),
      setStreamingContent: (content) => set({ streamingContent: content }),

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      resetSettings: () => {
        set({ settings: DEFAULT_SETTINGS });
      },
    }),
    {
      name: STORAGE_KEYS.appState,
      partialize: (state) => ({
        conversations: state.conversations,
        settings: state.settings,
      }),
    }
  )
);

// 辅助 hooks
export const useCurrentConversation = () => {
  const { conversations, currentConversationId } = useAppStore();
  return conversations.find((c) => c.id === currentConversationId) || null;
};

export const useSettings = () => useAppStore((state) => state.settings);
