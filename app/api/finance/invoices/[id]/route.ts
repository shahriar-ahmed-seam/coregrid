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
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Failed to fetch invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
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

    // Delete existing items if items are being updated
    if (body.items) {
      await prisma.invoiceItem.deleteMany({
        where: { invoiceId: id },
      });
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        customerId: body.customerId,
        status: body.status,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        subtotal: body.subtotal !== undefined ? new Prisma.Decimal(body.subtotal) : undefined,
        taxRate: body.taxRate !== undefined ? new Prisma.Decimal(body.taxRate) : undefined,
        taxAmount: body.taxAmount !== undefined ? new Prisma.Decimal(body.taxAmount) : undefined,
        discount: body.discount !== undefined ? new Prisma.Decimal(body.discount) : undefined,
        total: body.total !== undefined ? new Prisma.Decimal(body.total) : undefined,
        notes: body.notes,
        items: body.items ? {
          create: body.items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
            total: new Prisma.Decimal(item.quantity * item.unitPrice),
          })),
        } : undefined,
      },
      include: {
        customer: true,
        items: true,
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Failed to update invoice:", error);
    return NextResponse.json(
      { 
        error: "Failed to update invoice",
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

    // Items will be deleted automatically due to CASCADE
    await prisma.invoice.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete invoice:", error);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
