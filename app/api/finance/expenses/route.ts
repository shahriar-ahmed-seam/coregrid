import { NextRequest, NextResponse } from "next/server";
import prisma, { Prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        employee: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const expense = await prisma.expense.create({
      data: {
        employeeId: body.employeeId,
        category: body.category,
        description: body.description,
        amount: new Prisma.Decimal(body.amount),
        expenseDate: new Date(body.expenseDate),
        status: body.status || "PENDING",
        receiptUrl: body.receiptUrl || null,
        notes: body.notes || null,
      },
      include: {
        employee: true,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("Failed to create expense:", error);
    return NextResponse.json(
      { 
        error: "Failed to create expense",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
