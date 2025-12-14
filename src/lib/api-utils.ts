/**
 * API 路由公共工具函数
 */

import { createOpenRouter } from "@openrouter/ai-sdk-provider";

// ============================================
// OpenRouter 客户端
// ============================================

/** 创建 OpenRouter 客户端 */
export function createOpenRouterClient(apiKey: string) {
  return createOpenRouter({ apiKey });
}

// ============================================
// 时间格式化
// ============================================

/** 格式化当前时间为中文格式 */
export function formatCurrentTime(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  };
  return now.toLocaleString("zh-CN", options);
}

// ============================================
// 响应工具
// ============================================

/** 创建 JSON 错误响应 */
export function createErrorResponse(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** 创建 JSON 成功响应 */
export function createJsonResponse<T>(data: T): Response {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}

// ============================================
// 验证工具
// ============================================

/** 验证 API Key */
export function validateApiKey(apiKey: unknown): string {
  if (typeof apiKey !== "string" || apiKey.trim().length === 0) {
    throw new Error("API Key 未设置");
  }
  return apiKey;
}

/** 验证模型 */
export function validateModel(model: unknown): string {
  if (typeof model !== "string" || model.trim().length === 0) {
    throw new Error("模型未设置");
  }
  return model;
}

// ============================================
// 文本处理
// ============================================

/** 解析换行分隔的问题列表 */
export function parseQuestionList(text: string, maxCount: number): string[] {
  return text
    .split("\n")
    .map((q) => q.trim())
    .filter((q) => q.length > 0 && !q.match(/^\d+\./))
    .slice(0, maxCount);
}
