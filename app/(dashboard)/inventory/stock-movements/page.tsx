import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/layout/page-header";
import prisma from "@/lib/prisma";
import { StockMovementsTable } from "./stock-movements-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle, RefreshCw, Activity } from "lucide-react";

interface StockMovementsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    type?: string;
    product?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function StockMovementsPage({ searchParams }: StockMovementsPageProps) {
  await requireRole(["ADMIN", "INVENTORY"] as const);

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.search || "";
  const type = params.type || "";
  const productId = params.product || "";
  const sortBy = params.sortBy || "createdAt";
  const sortOrder = (params.sortOrder as "asc" | "desc") || "desc";
  const pageSize = 20;

  const where = {
    AND: [
      search
        ? {
            OR: [
              { product: { name: { contains: search, mode: "insensitive" as const } } },
              { product: { sku: { contains: search, mode: "insensitive" as const } } },
              { notes: { contains: search, mode: "insensitive" as const } },
              { reference: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {},
      type ? { type: type as "PURCHASE" | "SALE" | "ADJUSTMENT" | "RETURN" } : {},
      productId ? { productId } : {},
    ],
  };

  // Build orderBy object based on sortBy parameter
  const orderBy: any = {};
  if (sortBy === "createdAt") {
    orderBy.createdAt = sortOrder;
  } else if (sortBy === "type") {
    orderBy.type = sortOrder;
  } else if (sortBy === "quantity") {
    orderBy.quantity = sortOrder;
  } else {
    orderBy.createdAt = "desc"; // default
  }

  const [movements, total, typeCounts, products] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      include: {
        product: {
          select: { id: true, name: true, sku: true, unit: true },
        },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.stockMovement.count({ where }),
    prisma.stockMovement.groupBy({
      by: ["type"],
      _count: { id: true },
      _sum: { quantity: true },
    }),
    prisma.product.findMany({
      select: { id: true, name: true, sku: true },
      orderBy: { name: "asc" },
      take: 100,
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  const getTypeStats = (t: string) => {
    const stat = typeCounts.find((tc) => tc.type === t);
    return {
      count: stat?._count.id || 0,
      quantity: stat?._sum.quantity || 0,
    };
  };

  const purchaseStats = getTypeStats("PURCHASE");
  const saleStats = getTypeStats("SALE");
  const adjustStats = getTypeStats("ADJUSTMENT");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Movements"
        description="Track all inventory changes and adjustments"
        backHref="/inventory"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Movements</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {typeCounts.reduce((sum, tc) => sum + tc._count.id, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchases</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{purchaseStats.count}</div>
            <p className="text-xs text-muted-foreground">
              +{purchaseStats.quantity.toLocaleString()} units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{saleStats.count}</div>
            <p className="text-xs text-muted-foreground">
              {saleStats.quantity.toLocaleString()} units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adjustments</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{adjustStats.count}</div>
            <p className="text-xs text-muted-foreground">
              {adjustStats.quantity >= 0 ? "+" : ""}{adjustStats.quantity.toLocaleString()} units
            </p>
          </CardContent>
        </Card>
      </div>

      <StockMovementsTable
        movements={movements}
        products={products}
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        search={search}
        typeFilter={type}
        productFilter={productId}
      />
    </div>
  );
}
