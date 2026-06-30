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
    const search = searchParams.get("search") || "";
    const departmentId = searchParams.get("departmentId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { employeeId: { contains: search, mode: "insensitive" } },
      ];
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (status) {
      where.status = status;
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
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
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.employee.count({ where }),
    ]);

    return NextResponse.json({
      employees,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
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

    const employee = await prisma.employee.create({
      data: {
        employeeId: data.employeeId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        departmentId: data.departmentId,
        position: data.position,
        hireDate: new Date(data.hireDate),
        salary: data.salary,
        employmentType: data.employmentType,
        status: data.status || "ACTIVE",
        userId: data.userId,
      },
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
        action: "EMPLOYEE_CREATED",
        entityType: "Employee",
        entityId: employee.id,
        newValue: JSON.stringify(employee),
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    );
  }
}
