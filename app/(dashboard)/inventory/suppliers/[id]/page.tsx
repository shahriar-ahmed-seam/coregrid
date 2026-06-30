import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/layout/page-header";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SupplierProductsTable, SupplierOrdersTable } from "@/components/ui/supplier-tables";
import { 
  Edit, 
  Truck, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  User, 
  Calendar,
  Package,
  ShoppingCart,
  DollarSign
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface SupplierDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SupplierDetailPage({ params }: SupplierDetailPageProps) {
  await requireRole(["ADMIN", "INVENTORY"] as const);

  const { id } = await params;

  const [supplier, products, orders] = await Promise.all([
    prisma.supplier.findUnique({
      where: { id },
    }),
    prisma.product.findMany({
      where: { supplierId: id },
      select: {
        id: true,
        sku: true,
        name: true,
        stockLevel: true,
        costPrice: true,
        sellingPrice: true,
        isActive: true,
      },
      take: 10,
      orderBy: { name: "asc" },
    }),
    prisma.purchaseOrder.findMany({
      where: { supplierId: id },
      select: {
        id: true,
        poNumber: true,
        status: true,
        total: true,
        orderDate: true,
      },
      take: 10,
      orderBy: { orderDate: "desc" },
    }),
  ]);

  if (!supplier) {
    notFound();
  }

  // Serialize Decimal fields for client components
  const serializedProducts = products.map(p => ({
    ...p,
    costPrice: p.costPrice.toNumber(),
    sellingPrice: p.sellingPrice.toNumber(),
  }));

  const serializedOrders = orders.map(o => ({
    ...o,
    total: o.total.toNumber(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={supplier.name}
        description={supplier.code ? `Supplier Code: ${supplier.code}` : "Supplier details"}
        backHref="/inventory/suppliers"
      >
        <Link href={`/inventory/suppliers/${id}/edit`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Supplier
          </Button>
        </Link>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Supplier Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Supplier Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={supplier.isActive ? "default" : "secondary"}>
                {supplier.isActive ? "Active" : "Inactive"}
              </Badge>
              {supplier.paymentTerms && (
                <Badge variant="outline">{supplier.paymentTerms}</Badge>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {supplier.contactPerson && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{supplier.contactPerson}</span>
                </div>
              )}
              {supplier.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${supplier.email}`} className="text-primary hover:underline">
                    {supplier.email}
                  </a>
                </div>
              )}
              {supplier.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${supplier.phone}`} className="hover:underline">
                    {supplier.phone}
                  </a>
                </div>
              )}
              {supplier.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={supplier.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {supplier.website}
                  </a>
                </div>
              )}
            </div>

            {(supplier.address || supplier.city || supplier.state) && (
              <div className="flex items-start gap-2 pt-2 border-t">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  {supplier.address && <div>{supplier.address}</div>}
                  <div>
                    {[supplier.city, supplier.state, supplier.postalCode]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                  {supplier.country && <div>{supplier.country}</div>}
                </div>
              </div>
            )}

            {supplier.notes && (
              <div className="pt-2 border-t">
                <div className="text-sm font-medium mb-1">Notes</div>
                <p className="text-sm text-muted-foreground">{supplier.notes}</p>
              </div>
            )}

            <div className="pt-2 border-t flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Added {format(supplier.createdAt, "PPP")}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{serializedProducts.length}</div>
              <p className="text-xs text-muted-foreground">
                Products from this supplier
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Purchase Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{serializedOrders.length}</div>
              <p className="text-xs text-muted-foreground">
                Total orders placed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${serializedOrders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all orders
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products from this Supplier
          </CardTitle>
          <CardDescription>
            Products supplied by {supplier.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SupplierProductsTable products={serializedProducts} />
          {serializedProducts.length > 0 && (
            <div className="mt-4">
              <Link href={`/inventory/products?supplier=${id}`}>
                <Button variant="outline" size="sm">
                  View All Products
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Recent Purchase Orders
          </CardTitle>
          <CardDescription>
            Purchase orders placed with {supplier.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SupplierOrdersTable orders={serializedOrders} />
          {serializedOrders.length > 0 && (
            <div className="mt-4">
              <Link href={`/inventory/orders?supplier=${id}`}>
                <Button variant="outline" size="sm">
                  View All Orders
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
