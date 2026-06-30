import { NextRequest, NextResponse } from "next/server";
import prisma, { Prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const task = await prisma.task.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description || null,
        status: body.status,
        priority: body.priority,
        assigneeId: body.assigneeId || null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        estimatedHours: body.estimatedHours !== undefined 
          ? new Prisma.Decimal(body.estimatedHours) 
          : undefined,
        actualHours: body.actualHours !== undefined 
          ? new Prisma.Decimal(body.actualHours) 
          : undefined,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Failed to update task:", error);
    return NextResponse.json(
      { 
        error: "Failed to update task",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
