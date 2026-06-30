import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        manager: true,
        employees: {
          orderBy: { firstName: "asc" },
        },
      },
    });

    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    return NextResponse.json(department);
  } catch (error) {
    console.error("Error fetching department:", error);
    return NextResponse.json(
      { error: "Failed to fetch department" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { id } = await params;
    const oldDepartment = await prisma.department.findUnique({
      where: { id },
    });

    if (!oldDepartment) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.code !== undefined) updateData.code = data.code;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.managerId !== undefined) updateData.managerId = data.managerId;
    if (data.budget !== undefined) updateData.budget = data.budget;

    const department = await prisma.department.update({
      where: { id },
      data: updateData,
      include: {
        manager: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DEPARTMENT_UPDATED",
        entityType: "Department",
        entityId: department.id,
        oldValue: JSON.stringify(oldDepartment),
        newValue: JSON.stringify(department),
      },
    });

    return NextResponse.json(department);
  } catch (error) {
    console.error("Error updating department:", error);
    return NextResponse.json(
      { error: "Failed to update department" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            employees: true,
          },
        },
      },
    });

    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    if (department._count.employees > 0) {
      return NextResponse.json(
        { error: "Cannot delete department with employees" },
        { status: 400 }
      );
    }

    await prisma.department.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DEPARTMENT_DELETED",
        entityType: "Department",
        entityId: id,
        oldValue: JSON.stringify(department),
      },
    });

    return NextResponse.json({ message: "Department deleted successfully" });
  } catch (error) {
    console.error("Error deleting department:", error);
    return NextResponse.json(
      { error: "Failed to delete department" },
      { status: 500 }
    );
  }
}
