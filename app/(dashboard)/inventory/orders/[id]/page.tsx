import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/layout/page-header";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderItemsTable } from "@/components/ui/order-items-table";
import { 
  ShoppingCart, 
  Truck, 
  Calendar,
  Package,
  CheckCircle,
  Clock,
  FileText
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { CurrencyCell } from "@/components/ui/data-table-cells";
import { OrderActions } from "./order-actions";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  await requireRole(["ADMIN", "INVENTORY"] as const);

  const { id } = await params;

  const order = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      supplier: true,
      items: {
        include: {
          product: {
            select: { id: true, name: true, sku: true },
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  // Serialize Decimal fields for client components
  const serializedOrder = {
    ...order,
    subtotal: order.subtotal.toNumber(),
    tax: order.tax.toNumber(),
    total: order.total.toNumber(),
    items: order.items.map(item => ({
      ...item,
      unitPrice: item.unitPrice.toNumber(),
      total: item.total.toNumber(),
    })),
  };

  const getStatusIcon = () => {
    switch (order.status) {
      case "DRAFT":
        return <FileText className="h-5 w-5" />;
      case "ORDERED":
        return <Clock className="h-5 w-5" />;
      case "RECEIVED":
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <ShoppingCart className="h-5 w-5" />;
    }
  };

  const getStatusColor = () => {
    switch (order.status) {
      case "DRAFT":
        return "secondary";
      case "ORDERED":
        return "default";
      case "RECEIVED":
        return "default";
      case "CANCELLED":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Order ${serializedOrder.poNumber}`}
        description={`Purchase order from ${serializedOrder.supplier.name}`}
        backHref="/inventory/orders"
      >
        <OrderActions order={order} />
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Order Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon()}
              Order Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={getStatusColor() as "default" | "secondary" | "destructive" | "outline"}>
                {serializedOrder.status}
              </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Order Number</div>
                <div className="font-mono">{serializedOrder.poNumber}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Supplier</div>
                <Link 
                  href={`/inventory/suppliers/${serializedOrder.supplier.id}`}
                  className="flex items-center gap-1 hover:underline"
                >
                  <Truck className="h-4 w-4" />
                  {serializedOrder.supplier.name}
                </Link>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Order Date</div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {format(serializedOrder.orderDate, "PPP")}
                </div>
              </div>
              {serializedOrder.expectedDate && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Expected Delivery</div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {format(serializedOrder.expectedDate, "PPP")}
                  </div>
                </div>
              )}
              {serializedOrder.receivedDate && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Received Date</div>
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    {format(serializedOrder.receivedDate, "PPP")}
                  </div>
                </div>
              )}
            </div>

            {serializedOrder.notes && (
              <div className="pt-4 border-t">
                <div className="text-sm font-medium text-muted-foreground mb-1">Notes</div>
                <p className="text-sm">{serializedOrder.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Items</span>
              <span className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                {serializedOrder.items.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Quantity</span>
              <span>{serializedOrder.items.reduce((sum, i) => sum + i.quantity, 0).toLocaleString()}</span>
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <CurrencyCell value={serializedOrder.subtotal} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <CurrencyCell value={serializedOrder.tax} />
              </div>
              <div className="flex items-center justify-between font-bold text-lg border-t pt-2">
                <span>Total</span>
                <CurrencyCell value={serializedOrder.total} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Items
          </CardTitle>
          <CardDescription>
            Products included in this purchase order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrderItemsTable items={serializedOrder.items} />
        </CardContent>
      </Card>
    </div>
  );
}
