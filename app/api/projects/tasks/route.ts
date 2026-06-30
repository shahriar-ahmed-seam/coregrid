import { NextRequest, NextResponse } from "next/server";
import prisma, { Prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const task = await prisma.task.create({
      data: {
        projectId: body.projectId,
        title: body.title,
        description: body.description || null,
        status: body.status,
        priority: body.priority,
        assigneeId: body.assigneeId || null,
        creatorId: session.user.id,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        estimatedHours: body.estimatedHours ? new Prisma.Decimal(body.estimatedHours) : null,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json(
      { 
        error: "Failed to create task",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
