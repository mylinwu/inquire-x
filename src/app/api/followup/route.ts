import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

export const runtime = "edge";

interface FollowUpRequest {
  context: string;
  apiKey: string;
  model: string;
  followUpPrompt: string;
}

export async function POST(req: Request) {
  try {
    const body: FollowUpRequest = await req.json();
    const { context, apiKey, model, followUpPrompt } = body;

    if (!apiKey || !context || !model) {
      return new Response(JSON.stringify({ error: "缺少必需参数" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const openrouter = createOpenRouter({
      apiKey,
    });

    const result = await generateText({
      model: openrouter(model),
      system: followUpPrompt,
      prompt: `以下是对话内容：\n\n${context}\n\n请基于此生成三个追问问题。`,
    });

    const questions = result.text
      .split("\n")
      .map((q) => q.trim())
      .filter((q) => q.length > 0)
      .slice(0, 3);

    return new Response(JSON.stringify({ questions }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Follow-up API Error:", error);
    return new Response(
      JSON.stringify({ error: "生成追问失败" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
