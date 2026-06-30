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
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        leaveRequests: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        attendance: {
          orderBy: { date: "desc" },
          take: 10,
        },
      },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    return NextResponse.json(
      { error: "Failed to fetch employee" },
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
    const oldEmployee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!oldEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.dateOfBirth !== undefined) updateData.dateOfBirth = new Date(data.dateOfBirth);
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.zipCode !== undefined) updateData.zipCode = data.zipCode;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.departmentId !== undefined) updateData.departmentId = data.departmentId;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.hireDate !== undefined) updateData.hireDate = new Date(data.hireDate);
    if (data.salary !== undefined) updateData.salary = data.salary;
    if (data.employmentType !== undefined) updateData.employmentType = data.employmentType;
    if (data.status !== undefined) updateData.status = data.status;

    const employee = await prisma.employee.update({
      where: { id },
      data: updateData,
      include: {
        department: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "EMPLOYEE_UPDATED",
        entityType: "Employee",
        entityId: employee.id,
        oldValue: JSON.stringify(oldEmployee),
        newValue: JSON.stringify(employee),
      },
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json(
      { error: "Failed to update employee" },
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
    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    await prisma.employee.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "EMPLOYEE_DELETED",
        entityType: "Employee",
        entityId: id,
        oldValue: JSON.stringify(employee),
      },
    });

    return NextResponse.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json(
      { error: "Failed to delete employee" },
      { status: 500 }
    );
  }
}
