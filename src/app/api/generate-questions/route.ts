import { generateText } from "ai";
import {
  buildGenerateQuestionsPrompt,
  QUESTION_GENERATION_TEMPERATURE,
} from "@/config";
import {
  createOpenRouterClient,
  createErrorResponse,
  createJsonResponse,
  validateApiKey,
  validateModel,
  parseQuestionList,
} from "@/lib/api-utils";

export const runtime = "edge";

interface GenerateQuestionsRequest {
  apiKey: string;
  model: string;
  referenceQuestions: string[];
}

function validateInput(body: unknown): GenerateQuestionsRequest {
  if (!body || typeof body !== "object") {
    throw new Error("请求体无效");
  }

  const req = body as Record<string, unknown>;

  const apiKey = validateApiKey(req.apiKey);
  const model = validateModel(req.model);

  if (!Array.isArray(req.referenceQuestions)) {
    throw new Error("参考问题必须是数组");
  }

  return {
    apiKey,
    model,
    referenceQuestions: req.referenceQuestions,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { apiKey, model, referenceQuestions } = validateInput(body);

    const openrouter = createOpenRouterClient(apiKey);
    const prompt = buildGenerateQuestionsPrompt(referenceQuestions);

    const result = await generateText({
      model: openrouter(model),
      prompt,
      temperature: QUESTION_GENERATION_TEMPERATURE,
    });

    const questions = parseQuestionList(result.text, 6);

    return createJsonResponse({ questions });
  } catch (error) {
    console.error("Generate Questions API Error:", error);
    const message = error instanceof Error ? error.message : "生成问题失败";
    return createErrorResponse(message);
  }
}
