import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { CategoryForm } from "../category-form";

export default async function NewCategoryPage() {
  await requireRole(["ADMIN", "INVENTORY"] as const);

  const allCategories = await prisma.productCategory.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Category"
        description="Create a new product category"
        backHref="/inventory/categories"
      />

      <Card>
        <CardContent className="pt-6">
          <CategoryForm allCategories={allCategories} />
        </CardContent>
      </Card>
    </div>
  );
}
