import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/layout/page-header";
import { ProductsTable } from "./products-table";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Package } from "lucide-react";

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    size?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    category?: string;
    supplier?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  await requireRole(["ADMIN", "INVENTORY"] as const);

  const params = await searchParams;
  const page = parseInt(params.page || "0", 10);
  const size = parseInt(params.size || "10", 10);
  const search = params.search || "";
  const sortBy = params.sortBy || "createdAt";
  const sortOrder = (params.sortOrder as "asc" | "desc") || "desc";
  const categoryFilter = params.category;
  const supplierFilter = params.supplier;

  // Build where clause
  const where: Record<string, unknown> = { isActive: true };
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (categoryFilter) {
    where.categoryId = categoryFilter;
  }

  if (supplierFilter) {
    where.supplierId = supplierFilter;
  }

  // Fetch products with pagination
  const [productsRaw, totalCount, categories, suppliers] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: page * size,
      take: size,
      orderBy: { [sortBy]: sortOrder },
      include: {
        category: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
    }),
    prisma.product.count({ where }),
    prisma.productCategory.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.supplier.findMany({
      select: { id: true, name: true },
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // Serialize Decimal fields to numbers for client component
  const products = productsRaw.map(product => ({
    ...product,
    costPrice: product.costPrice.toNumber(),
    sellingPrice: product.sellingPrice.toNumber(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description={`Manage your product catalog (${totalCount} products)`}
        backHref="/inventory"
      >
        <Button asChild>
          <Link href="/inventory/products/new">
            <Package className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </PageHeader>

      <ProductsTable
        products={products}
        totalCount={totalCount}
        pageIndex={page}
        pageSize={size}
        categories={categories}
        suppliers={suppliers}
      />
    </div>
  );
}
