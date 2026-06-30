import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/layout/page-header";
import prisma from "@/lib/prisma";
import { OrdersTable } from "./orders-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Clock, CheckCircle, XCircle, FileText } from "lucide-react";

interface OrdersPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    supplier?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  await requireRole(["ADMIN", "INVENTORY"] as const);

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.search || "";
  const status = params.status || "";
  const supplierId = params.supplier || "";
  const sortBy = params.sortBy || "createdAt";
  const sortOrder = (params.sortOrder as "asc" | "desc") || "desc";
  const pageSize = 15;

  const where = {
    AND: [
      search
        ? {
            OR: [
              { poNumber: { contains: search, mode: "insensitive" as const } },
              { supplier: { name: { contains: search, mode: "insensitive" as const } } },
            ],
          }
        : {},
      status ? { status: status as "DRAFT" | "ORDERED" | "RECEIVED" | "CANCELLED" } : {},
      supplierId ? { supplierId } : {},
    ],
  };

  // Build orderBy object based on sortBy parameter
  const orderBy: any = {};
  if (sortBy === "poNumber") {
    orderBy.poNumber = sortOrder;
  } else if (sortBy === "createdAt") {
    orderBy.createdAt = sortOrder;
  } else {
    orderBy.createdAt = "desc"; // default
  }

  const [orders, total, statusCounts, suppliers] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where,
      include: {
        supplier: {
          select: { id: true, name: true },
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.purchaseOrder.count({ where }),
    prisma.purchaseOrder.groupBy({
      by: ["status"],
      _count: { id: true },
      _sum: { total: true },
    }),
    prisma.supplier.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  // Serialize Decimal fields for client components
  const serializedOrders = orders.map(order => ({
    ...order,
    subtotal: order.subtotal.toNumber(),
    tax: order.tax.toNumber(),
    total: order.total.toNumber(),
  }));

  const getStatusCount = (s: string) => statusCounts.find((sc) => sc.status === s)?._count.id || 0;
  const getStatusTotal = (s: string) => {
    const total = statusCounts.find((sc) => sc.status === s)?._sum.total;
    return total ? Number(total) : 0;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        description="Manage purchase orders from suppliers"
        backHref="/inventory"
      >
        <Link href="/inventory/orders/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </Link>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statusCounts.reduce((sum, s) => sum + s._count.id, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getStatusCount("DRAFT")}</div>
            <p className="text-xs text-muted-foreground">
              ${getStatusTotal("DRAFT").toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ordered</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{getStatusCount("ORDERED")}</div>
            <p className="text-xs text-muted-foreground">
              ${getStatusTotal("ORDERED").toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Received</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{getStatusCount("RECEIVED")}</div>
            <p className="text-xs text-muted-foreground">
              ${getStatusTotal("RECEIVED").toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{getStatusCount("CANCELLED")}</div>
            <p className="text-xs text-muted-foreground">
              ${getStatusTotal("CANCELLED").toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <OrdersTable
        orders={serializedOrders}
        suppliers={suppliers}
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        search={search}
        statusFilter={status}
        supplierFilter={supplierId}
      />
    </div>
  );
}
