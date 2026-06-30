import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/layout/page-header";
import prisma from "@/lib/prisma";
import { SuppliersTable } from "./suppliers-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, CheckCircle, XCircle, Package } from "lucide-react";

interface SuppliersPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function SuppliersPage({ searchParams }: SuppliersPageProps) {
  await requireRole(["ADMIN", "INVENTORY"] as const);

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.search || "";
  const status = params.status || "";
  const sortBy = params.sortBy || "name";
  const sortOrder = (params.sortOrder as "asc" | "desc") || "asc";
  const pageSize = 15;

  const where = {
    AND: [
      search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { code: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
              { contactPerson: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {},
      status === "active" ? { isActive: true } : {},
      status === "inactive" ? { isActive: false } : {},
    ],
  };

  // Build orderBy object based on sortBy parameter
  const orderBy: any = {};
  if (sortBy === "name") {
    orderBy.name = sortOrder;
  } else {
    orderBy.name = "asc"; // default
  }

  const [suppliers, total, stats] = await Promise.all([
    prisma.supplier.findMany({
      where,
      include: {
        _count: {
          select: {
            products: true,
            purchaseOrders: true,
          },
        },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.supplier.count({ where }),
    prisma.supplier.groupBy({
      by: ["isActive"],
      _count: { id: true },
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);
  const activeCount = stats.find((s) => s.isActive)?._count.id || 0;
  const inactiveCount = stats.find((s) => !s.isActive)?._count.id || 0;
  const totalSuppliers = activeCount + inactiveCount;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        description="Manage your product suppliers and vendors"
        backHref="/inventory"
      >
        <Link href="/inventory/suppliers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </Link>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSuppliers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inactiveCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Supplied</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {suppliers.reduce((acc, s) => acc + s._count.products, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <SuppliersTable
        suppliers={suppliers}
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        search={search}
        statusFilter={status}
      />
    </div>
  );
}
