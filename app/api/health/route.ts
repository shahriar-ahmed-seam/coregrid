import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    // Check if Ollama is available (optional)
    let ollamaStatus = "unavailable";
    if (process.env.OLLAMA_BASE_URL) {
      try {
        const response = await fetch(`${process.env.OLLAMA_BASE_URL}/api/tags`, {
          signal: AbortSignal.timeout(5000),
        });
        if (response.ok) {
          ollamaStatus = "available";
        }
      } catch {
        ollamaStatus = "unavailable";
      }
    }

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "connected",
        ollama: ollamaStatus,
      },
      version: process.env.npm_package_version || "unknown",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
