import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";

export const runtime = "edge";

interface ChatRequest {
  messages: { role: "user" | "assistant"; content: string }[];
  apiKey: string;
  model: string;
  systemPrompt: string;
  phase: "thinking" | "questioning" | "polishing";
  username?: string;
}

const PHASE_PROMPTS = {
  thinking: `请直接回答用户的问题。给出你的初步思考和回答。`,
  questioning: `请审视你刚才的回答，找出其中可能不够严谨、片面或有遗漏的地方。指出2-3个值得反思的点。`,
  polishing: `基于之前的回答和反思，现在给出最终优化后的答复。整合之前的思考，给出更完善、更有深度的回答。使用 Markdown 格式化输出。`,
};

const VALID_PHASES = ["thinking", "questioning", "polishing"] as const;

function validateInput(body: unknown): ChatRequest {
  if (!body || typeof body !== "object") {
    throw new Error("请求体无效");
  }

  const req = body as Record<string, unknown>;

  if (!Array.isArray(req.messages)) {
    throw new Error("messages 必须是数组");
  }

  if (typeof req.apiKey !== "string" || req.apiKey.trim().length === 0) {
    throw new Error("API Key 未设置");
  }

  if (typeof req.model !== "string" || req.model.trim().length === 0) {
    throw new Error("模型未设置");
  }

  if (typeof req.systemPrompt !== "string") {
    throw new Error("系统提示词无效");
  }

  if (!VALID_PHASES.includes(req.phase as any)) {
    throw new Error("阶段参数无效");
  }

  return {
    messages: req.messages,
    apiKey: req.apiKey,
    model: req.model,
    systemPrompt: req.systemPrompt,
    phase: req.phase as ChatRequest["phase"],
    username: typeof req.username === "string" ? req.username : undefined,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, apiKey, model, systemPrompt, phase, username } = validateInput(body);

    const openrouter = createOpenRouter({
      apiKey,
    });

    let finalSystemPrompt = systemPrompt;
    if (username) {
      finalSystemPrompt = finalSystemPrompt.replace(/{username}/g, username);
    }
    finalSystemPrompt += `\n\n${PHASE_PROMPTS[phase]}`;

    const result = streamText({
      model: openrouter(model),
      system: finalSystemPrompt,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    const message = error instanceof Error ? error.message : "请求失败";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
