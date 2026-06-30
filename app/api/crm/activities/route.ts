import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const activity = await prisma.dealActivity.create({
      data: {
        dealId: body.dealId,
        type: body.type,
        subject: body.subject,
        description: body.description || null,
        date: new Date(body.date),
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("Failed to create activity:", error);
    return NextResponse.json(
      { 
        error: "Failed to create activity",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
