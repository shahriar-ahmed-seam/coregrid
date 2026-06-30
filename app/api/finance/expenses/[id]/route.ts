import { NextRequest, NextResponse } from "next/server";
import prisma, { Prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        employee: true,
      },
    });

    if (!expense) {
      return NextResponse.json(
        { error: "Expense not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Failed to fetch expense:", error);
    return NextResponse.json(
      { error: "Failed to fetch expense" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        employeeId: body.employeeId,
        category: body.category,
        description: body.description,
        amount: body.amount !== undefined ? new Prisma.Decimal(body.amount) : undefined,
        expenseDate: body.expenseDate ? new Date(body.expenseDate) : undefined,
        status: body.status,
        receiptUrl: body.receiptUrl,
        notes: body.notes,
      },
      include: {
        employee: true,
      },
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Failed to update expense:", error);
    return NextResponse.json(
      { 
        error: "Failed to update expense",
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
    const { id } = await params;

    await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete expense:", error);
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    );
  }
}
