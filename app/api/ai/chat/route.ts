import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { aiAssistant, OllamaMessage } from "@/lib/ai/ollama";
import { z } from "zod";

const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string(),
    })
  ),
  module: z.string().optional(),
  systemPrompt: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = chatSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0]?.message || "Invalid request" },
        { status: 400 }
      );
    }

    const { messages, module = "GENERAL", systemPrompt } = validationResult.data;

    // Call AI assistant
    const result = await aiAssistant.chat(
      session.user.id,
      module,
      messages as OllamaMessage[],
      systemPrompt
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "AI request failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: result.data,
      tokensUsed: result.tokensUsed,
      duration: result.duration,
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { error: "Failed to process AI request" },
      { status: 500 }
    );
  }
}
