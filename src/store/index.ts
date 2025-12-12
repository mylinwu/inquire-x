import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Conversation, Message, Settings, ThinkingPhase } from "@/types";

const DEFAULT_RECOMMENDED_QUESTIONS = [
  "给我一个今天值得我停下来思考一分钟的东西。",
  "给我一个能拓宽我视角的想法，不要求有主题。",
  "告诉我一个会让我产生'我以前从没这样想过'的洞见。",
  "说一个如果我现在听到会对我有益的提醒。",
  "给我一个可能改变我接下来几小时思路的小火花。",
  "随机带我看见一种更有趣的思考方式。",
  "给我一个能轻轻推动我、但方向未知的念头。",
  "告诉我一个你觉得此刻最值得让我知道的小真相。",
  "随便帮我设计一个低成本的产品方案。",
];

const DEFAULT_SYSTEM_PROMPT = `你是一个富有洞察力的AI助手。回答时请：
1. 深入思考问题本质
2. 给出独特且有价值的见解
3. 用简洁清晰的语言表达
4. 适当使用 Markdown 格式化输出`;

const DEFAULT_FOLLOW_UP_PROMPT = `基于之前的对话，生成三个简短的追问问题：
1. 一个质疑你回答的问题，引导反思
2. 一个针对某个知识点的深入追问
3. 一个相关但角度不同的新问题

只输出三个问题，每行一个，不要编号或其他内容。`;

const DEFAULT_SETTINGS: Settings = {
  username: "",
  apiKey: "",
  model: "anthropic/claude-3.5-sonnet",
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  followUpPrompt: DEFAULT_FOLLOW_UP_PROMPT,
  recommendedQuestions: DEFAULT_RECOMMENDED_QUESTIONS,
  enableThreePhase: true,
  streamSpeed: "medium",
  markdownSafetyLevel: "normal",
};

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
    (set, get) => ({
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
      name: "inquire-x-storage",
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
