import { NextResponse } from "next/server";
import prisma, { Prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        customer: true,
        contact: true,
        salesRep: true,
        activities: true,
      },
    });

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    return NextResponse.json(deal);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch deal" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const deal = await prisma.deal.update({
      where: { id },
      data: {
        title: body.title,
        customerId: body.customerId,
        contactId: body.contactId || null,
        salesRepId: body.salesRepId,
        value: new Prisma.Decimal(body.value),
        stage: body.stage,
        probability: body.probability,
        expectedCloseDate: body.expectedCloseDate ? new Date(body.expectedCloseDate) : undefined,
        description: body.description || null,
      },
    });

    return NextResponse.json(deal);
  } catch (error) {
    console.error("Failed to update deal:", error);
    return NextResponse.json(
      { 
        error: "Failed to update deal",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.deal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete deal" },
      { status: 500 }
    );
  }
}
