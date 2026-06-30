import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/layout/page-header";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit, Package, ArrowUpDown } from "lucide-react";
import { StockMovementsTable } from "@/components/ui/stock-movements-table";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  await requireRole(["ADMIN", "INVENTORY"] as const);

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      supplier: true,
      stockMovements: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!product) {
    notFound();
  }

  const getStockStatus = () => {
    if (product.stockLevel === 0) return { label: "Out of Stock", variant: "destructive" as const };
    if (product.stockLevel <= product.reorderPoint) return { label: "Low Stock", variant: "secondary" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  const status = getStockStatus();

  // Serialize Decimal fields
  const serializedProduct = {
    ...product,
    costPrice: product.costPrice.toNumber(),
    sellingPrice: product.sellingPrice.toNumber(),
  };

  const margin = serializedProduct.sellingPrice - serializedProduct.costPrice;
  const marginPercent = serializedProduct.costPrice > 0 
    ? ((margin / serializedProduct.costPrice) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        description={`SKU: ${product.sku}`}
        backHref="/inventory/products"
      >
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/inventory/products/${id}/adjust-stock`}>
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Adjust Stock
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/inventory/products/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Product
            </Link>
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Product Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">SKU</p>
                <p className="font-mono font-medium">{product.sku}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{product.category?.name || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Supplier</p>
                <p className="font-medium">{product.supplier?.name || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unit</p>
                <p className="font-medium">{product.unit}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <Badge variant={product.isActive ? "default" : "secondary"}>
                  {product.isActive ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
            {product.description && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm">{product.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock & Pricing */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stock Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{product.stockLevel}</div>
              <p className="text-sm text-muted-foreground">
                Reorder at {product.reorderPoint} {product.unit}
              </p>
              {product.stockLevel <= product.reorderPoint && (
                <p className="text-sm text-orange-600 mt-2">
                  ⚠️ Stock is at or below reorder point
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Cost Price</span>
                <span className="font-medium">${serializedProduct.costPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Selling Price</span>
                <span className="font-medium">${serializedProduct.sellingPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-sm text-muted-foreground">Margin</span>
                <span className="font-medium text-green-600">
                  ${margin.toFixed(2)} ({marginPercent}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Inventory Value</span>
                <span className="font-medium">
                  ${(product.stockLevel * serializedProduct.costPrice).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stock Movements */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Movement History</CardTitle>
        </CardHeader>
        <CardContent>
          <StockMovementsTable movements={product.stockMovements} />
        </CardContent>
      </Card>
    </div>
  );
}
