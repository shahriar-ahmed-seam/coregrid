import { NextResponse } from "next/server";
import { getAIStatus } from "@/lib/ai/ollama";

export async function GET() {
  try {
    const status = await getAIStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error("AI status check failed:", error);
    return NextResponse.json(
      { 
        available: false, 
        models: [], 
        defaultModel: "llama3.2",
        hasDefaultModel: false,
        error: "Failed to check AI status" 
      },
      { status: 500 }
    );
  }
}
