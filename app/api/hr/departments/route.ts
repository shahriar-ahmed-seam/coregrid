import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const departments = await prisma.department.findMany({
      include: {
        manager: true,
        _count: {
          select: {
            employees: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const department = await prisma.department.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        managerId: data.managerId,
        budget: data.budget,
      },
      include: {
        manager: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DEPARTMENT_CREATED",
        entityType: "Department",
        entityId: department.id,
        newValue: JSON.stringify(department),
      },
    });

    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    console.error("Error creating department:", error);
    return NextResponse.json(
      { error: "Failed to create department" },
      { status: 500 }
    );
  }
}
