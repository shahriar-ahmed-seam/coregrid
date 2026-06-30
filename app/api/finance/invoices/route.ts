import { NextRequest, NextResponse } from "next/server";
import prisma, { Prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        customer: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Generate invoice number
    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${String(count + 1).padStart(5, "0")}`;

    // Create invoice with items
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId: body.customerId,
        status: body.status,
        issueDate: new Date(),
        dueDate: new Date(body.dueDate),
        subtotal: new Prisma.Decimal(body.subtotal),
        taxRate: new Prisma.Decimal(body.taxRate),
        taxAmount: new Prisma.Decimal(body.taxAmount),
        discount: new Prisma.Decimal(body.discount),
        total: new Prisma.Decimal(body.total),
        notes: body.notes || null,
        items: {
          create: body.items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
            total: new Prisma.Decimal(item.quantity * item.unitPrice),
          })),
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("Failed to create invoice:", error);
    return NextResponse.json(
      { 
        error: "Failed to create invoice",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
