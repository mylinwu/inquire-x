/**
 * 集中管理所有默认配置
 */

import type { Settings } from "@/types";
import {
  DEFAULT_SYSTEM_PROMPT,
  DEFAULT_FOLLOW_UP_PROMPT,
  DEFAULT_RECOMMENDED_QUESTIONS,
} from "./prompts";

// ============================================
// 默认设置
// ============================================

/** 默认设置配置 */
export const DEFAULT_SETTINGS: Settings = {
  username: "",
  apiKey: "",
  model: "anthropic/claude-3.5-sonnet",
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  followUpPrompt: DEFAULT_FOLLOW_UP_PROMPT,
  recommendedQuestions: DEFAULT_RECOMMENDED_QUESTIONS,
  enableThreePhase: true,
  enableAIGeneratedQuestions: false,
  streamSpeed: "medium",
  markdownSafetyLevel: "normal",
  temperature: 1.0,
};

// ============================================
// API 配置
// ============================================

/** 有效的回复阶段 */
export const VALID_PHASES = ["drafting", "questioning", "polishing"] as const;

/** 默认温度参数 */
export const DEFAULT_TEMPERATURE = 0.8;

/** 问题生成温度参数 */
export const QUESTION_GENERATION_TEMPERATURE = 1.0;

// ============================================
// 存储配置
// ============================================

/** 本地存储键名 */
export const STORAGE_KEYS = {
  appState: "inquire-x-storage",
  aiQuestions: "inquire-x-ai-questions",
} as const;
