import { generateText } from "ai";
import { buildFollowUpContextPrompt } from "@/config";
import {
  createOpenRouterClient,
  createErrorResponse,
  createJsonResponse,
} from "@/lib/api-utils";

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
      return createErrorResponse("缺少必需参数");
    }

    const openrouter = createOpenRouterClient(apiKey);

    const result = await generateText({
      model: openrouter(model),
      system: followUpPrompt,
      prompt: buildFollowUpContextPrompt(context),
    });

    const questions = result.text
      .split("\n")
      .map((q) => q.trim())
      .filter((q) => q.length > 0)
      .slice(0, 3);

    return createJsonResponse({ questions });
  } catch (error) {
    console.error("Follow-up API Error:", error);
    return createErrorResponse("生成追问失败", 500);
  }
}
