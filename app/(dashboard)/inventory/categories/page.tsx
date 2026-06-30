import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/layout/page-header";
import prisma from "@/lib/prisma";
import { CategoriesTable } from "./categories-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

interface CategoriesPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  await requireRole(["ADMIN", "INVENTORY"] as const);

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.search || "";
  const sortBy = params.sortBy || "name";
  const sortOrder = (params.sortOrder as "asc" | "desc") || "asc";
  const pageSize = 20;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  // Build orderBy object based on sortBy parameter
  const orderBy: any = {};
  if (sortBy === "name") {
    orderBy.name = sortOrder;
  } else {
    orderBy.name = "asc"; // default
  }

  const [categories, total, allCategories] = await Promise.all([
    prisma.productCategory.findMany({
      where,
      include: {
        parent: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.productCategory.count({ where }),
    // Get all categories for parent selection
    prisma.productCategory.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // Serialize categories to remove any non-serializable data
  const serializedCategories = categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    parent: cat.parent,
    _count: cat._count,
  }));

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Categories"
        description="Organize products into categories and subcategories"
        backHref="/inventory"
      >
        <Link href="/inventory/categories/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </Link>
      </PageHeader>

      <CategoriesTable
        categories={serializedCategories}
        allCategories={allCategories}
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        search={search}
      />
    </div>
  );
}
