import { NextResponse } from "next/server";
import prisma, { Prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const deals = await prisma.deal.findMany({
      include: {
        customer: true,
        contact: true,
        salesRep: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(deals);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch deals" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Clean and prepare data
    const data: any = {
      title: body.title,
      customerId: body.customerId,
      salesRepId: body.salesRepId,
      stage: body.stage,
      priority: body.priority,
      value: new Prisma.Decimal(body.value),
    };

    // Add optional fields only if they exist
    if (body.contactId) data.contactId = body.contactId;
    if (body.probability !== undefined && body.probability !== null) data.probability = body.probability;
    if (body.expectedCloseDate) data.expectedCloseDate = new Date(body.expectedCloseDate);
    if (body.description) data.description = body.description;

    const deal = await prisma.deal.create({
      data,
    });

    return NextResponse.json(deal, { status: 201 });
  } catch (error) {
    console.error("Failed to create deal:", error);
    return NextResponse.json(
      { error: "Failed to create deal", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
