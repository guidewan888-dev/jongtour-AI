import { NextResponse } from "next/server";
import OpenAI from "openai";

// POST to run a prompt in the playground
export async function POST(req: Request) {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    return NextResponse.json({ error: "OpenAI API Key is missing in environment variables" }, { status: 500 });
  }

  const openai = new OpenAI({ apiKey: openaiApiKey });

  try {
    const body = await req.json();
    const { systemPrompt, userMessage, model = "gpt-4o", temperature = 0.7 } = body;

    if (!systemPrompt || !userMessage) {
      return NextResponse.json({ error: "systemPrompt and userMessage are required" }, { status: 400 });
    }

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage }
    ];

    // Note: In MVP playground, we don't necessarily pass real tools config unless needed.
    // For now, let's do a pure chat completion to test prompt instructions.
    const response = await openai.chat.completions.create({
      model,
      temperature,
      messages,
      // tools: toolsConfig, // Optional: connect tools if we want full testing
    });

    const choice = response.choices[0].message;

    return NextResponse.json({ 
      success: true, 
      reply: choice.content,
      toolCalls: choice.tool_calls || []
    });

  } catch (error: any) {
    console.error("AI Playground API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to run playground test" }, { status: 500 });
  }
}
