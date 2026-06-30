import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get("supplier");

    const where = {
      isActive: true,
      ...(supplierId ? { supplierId } : {}),
    };

    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        sku: true,
        costPrice: true,
      },
      orderBy: { name: "asc" },
      take: 100,
    });

    // Convert Decimal to number for JSON serialization
    const serialized = products.map((p) => ({
      ...p,
      costPrice: p.costPrice.toNumber(),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
