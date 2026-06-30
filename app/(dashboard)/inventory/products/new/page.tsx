import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/layout/page-header";
import { ProductForm } from "../product-form";
import prisma from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";

export default async function NewProductPage() {
  await requireRole(["ADMIN", "INVENTORY"] as const);

  const [categories, suppliers] = await Promise.all([
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Product"
        description="Create a new product in your inventory"
        backHref="/inventory/products"
      />

      <Card>
        <CardContent className="pt-6">
          <ProductForm
            categories={categories}
            suppliers={suppliers}
          />
        </CardContent>
      </Card>
    </div>
  );
}
