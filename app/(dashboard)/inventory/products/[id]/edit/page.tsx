import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/layout/page-header";
import { ProductForm } from "../../product-form";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  await requireRole(["ADMIN", "INVENTORY"] as const);

  const { id } = await params;

  const [product, categories, suppliers] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
    }),
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

  if (!product) {
    notFound();
  }

  // Serialize Decimal fields to numbers for client component
  const serializedProduct = {
    ...product,
    costPrice: product.costPrice.toNumber(),
    sellingPrice: product.sellingPrice.toNumber(),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit: ${product.name}`}
        description="Update product information"
        backHref={`/inventory/products/${id}`}
      />

      <Card>
        <CardContent className="pt-6">
          <ProductForm
            product={serializedProduct}
            categories={categories}
            suppliers={suppliers}
          />
        </CardContent>
      </Card>
    </div>
  );
}
