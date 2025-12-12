export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  thinkingPhase?: ThinkingPhase;
  followUpQuestions?: string[];
}

export type ThinkingPhase = 
  | "thinking"      // 思考中
  | "questioning"   // 自我质疑中
  | "polishing"     // 打磨中
  | "complete";     // 完成

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  username: string;
  apiKey: string;
  model: string;
  systemPrompt: string;
  followUpPrompt: string;
  recommendedQuestions: string[];
  enableThreePhase: boolean;
  streamSpeed: "slow" | "medium" | "fast";
  markdownSafetyLevel: "strict" | "normal" | "loose";
}

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  pricing?: {
    prompt: string;
    completion: string;
  };
}
