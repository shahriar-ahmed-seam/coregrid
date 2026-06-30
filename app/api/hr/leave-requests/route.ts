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

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    const status = searchParams.get("status");

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;

    const leaveRequests = await prisma.leaveRequest.findMany({
      where,
      include: {
        employee: true,
        approver: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(leaveRequests);
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch leave requests" },
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

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId: data.employeeId,
        leaveType: data.leaveType,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        days: data.days,
        reason: data.reason,
        status: data.status || "PENDING",
      },
      include: {
        employee: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "LEAVE_REQUEST_CREATED",
        entityType: "LeaveRequest",
        entityId: leaveRequest.id,
        newValue: JSON.stringify(leaveRequest),
      },
    });

    return NextResponse.json(leaveRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating leave request:", error);
    return NextResponse.json(
      { error: "Failed to create leave request" },
      { status: 500 }
    );
  }
}
