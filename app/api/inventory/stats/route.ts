import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    await requireRole(["ADMIN", "INVENTORY"] as const);

    // Fetch inventory statistics
    const [
      totalProducts,
      outOfStockCount,
      pendingOrders,
      recentProductsRaw,
      categories,
      suppliers,
      products,
    ] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: true, stockLevel: 0 } }),
      prisma.purchaseOrder.count({ where: { status: { in: ["DRAFT", "ORDERED", "SUBMITTED", "APPROVED"] } } }),
      prisma.product.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { name: true } },
          supplier: { select: { name: true } },
        },
      }),
      prisma.productCategory.count(),
      prisma.supplier.count(),
      prisma.product.findMany({
        select: { stockLevel: true, costPrice: true, reorderPoint: true },
        where: { isActive: true },
      }),
    ]);

    // Serialize Decimal fields and add status
    const recentProducts = recentProductsRaw.map((product: any) => {
      const stock = product.stockLevel;
      const reorder = product.reorderPoint;
      const status = stock === 0 
        ? { label: "Out of Stock", variant: "destructive" as const }
        : stock <= reorder 
        ? { label: "Low Stock", variant: "warning" as const }
        : { label: "In Stock", variant: "default" as const };
      
      return {
        ...product,
        costPrice: product.costPrice.toNumber(),
        sellingPrice: product.sellingPrice.toNumber(),
        status,
      };
    });

    // Calculate inventory stats
    const inventoryValue = products.reduce(
      (sum: number, p: any) => sum + p.stockLevel * Number(p.costPrice),
      0
    );
    const lowStockCount = products.filter(
      (p: any) => p.stockLevel <= p.reorderPoint && p.stockLevel > 0
    ).length;

    return NextResponse.json({
      totalProducts,
      inventoryValue,
      lowStockCount,
      outOfStockCount,
      categories,
      suppliers,
      pendingOrders,
      recentProducts,
    });
  } catch (error) {
    console.error("Error fetching inventory stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory stats" },
      { status: 500 }
    );
  }
}
