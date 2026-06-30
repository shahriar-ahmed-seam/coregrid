import { NextRequest, NextResponse } from "next/server";
import prisma, { Prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      include: {
        department: true,
        tasks: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description || null,
        departmentId: body.departmentId && body.departmentId !== "none" ? body.departmentId : null,
        status: body.status,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        budget: body.budget ? new Prisma.Decimal(body.budget) : null,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json(
      { 
        error: "Failed to create project",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
