import { streamText } from "ai";
import { PHASE_PROMPTS, VALID_PHASES, DEFAULT_TEMPERATURE } from "@/config";
import {
  createOpenRouterClient,
  formatCurrentTime,
  createErrorResponse,
  validateApiKey,
  validateModel,
} from "@/lib/api-utils";

export const runtime = "edge";

interface ChatRequest {
  messages: { role: "user" | "assistant"; content: string }[];
  apiKey: string;
  model: string;
  systemPrompt: string;
  phase: "drafting" | "questioning" | "polishing";
  username?: string;
  temperature?: number;
}

function validateInput(body: unknown): ChatRequest {
  if (!body || typeof body !== "object") {
    throw new Error("请求体无效");
  }

  const req = body as Record<string, unknown>;

  if (!Array.isArray(req.messages)) {
    throw new Error("messages 必须是数组");
  }

  const apiKey = validateApiKey(req.apiKey);
  const model = validateModel(req.model);

  if (typeof req.systemPrompt !== "string") {
    throw new Error("系统提示词无效");
  }

  if (!VALID_PHASES.includes(req.phase as ChatRequest["phase"])) {
    throw new Error("阶段参数无效");
  }

  return {
    messages: req.messages,
    apiKey,
    model,
    systemPrompt: req.systemPrompt,
    phase: req.phase as ChatRequest["phase"],
    username: typeof req.username === "string" ? req.username : undefined,
    temperature: typeof req.temperature === "number" ? req.temperature : DEFAULT_TEMPERATURE,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, apiKey, model, systemPrompt, phase, username, temperature } = validateInput(body);

    const openrouter = createOpenRouterClient(apiKey);

    // 构建系统提示词
    let finalSystemPrompt = systemPrompt;
    
    // 添加用户称呼
    if (username) {
      finalSystemPrompt = finalSystemPrompt.replace(/{username}/g, username);
      finalSystemPrompt = `你可以称呼我为“${username}”。\n\n${finalSystemPrompt}`;
    }
    
    // 添加当前时间
    const currentTime = formatCurrentTime();
    finalSystemPrompt = `当前时间：${currentTime}\n\n${finalSystemPrompt}`;
    
    finalSystemPrompt += `\n\n${PHASE_PROMPTS[phase]}`;

    const result = streamText({
      model: openrouter(model),
      system: finalSystemPrompt,
      messages,
      temperature,
    });

    return result.toDataStreamResponse({
      sendReasoning: true,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    const message = error instanceof Error ? error.message : "请求失败";
    return createErrorResponse(message);
  }
}
