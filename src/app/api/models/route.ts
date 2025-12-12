export const runtime = "edge";

interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  pricing?: {
    prompt: string;
    completion: string;
  };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const apiKey = url.searchParams.get("apiKey");

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API Key 未提供" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "获取模型列表失败" }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const models: OpenRouterModel[] = data.data.map((m: Record<string, any>) => ({
      id: m.id,
      name: m.name,
      description: m.description,
      context_length: m.context_length,
      pricing: m.pricing,
    }));

    return new Response(JSON.stringify({ models }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Models API Error:", error);
    return new Response(
      JSON.stringify({ error: "获取模型列表失败" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
