"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Package, AlertTriangle, TrendingUp, Boxes, Truck, DollarSign, Plus, ListChecks } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, Column } from "@/components/ui/data-table";
import { CurrencyCell, StockLevelCell } from "@/components/ui/data-table-cells";
import { AIInsightsButton } from "@/components/ai/ai-chat-panel";
import { Badge } from "@/components/ui/badge";

type ProductWithRelations = {
  id: string;
  sku: string;
  name: string;
  stockLevel: number;
  reorderPoint: number;
  costPrice: number;
  sellingPrice: number;
  category: { name: string } | null;
  supplier: { name: string } | null;
  status: { label: string; variant: "destructive" | "warning" | "default" };
};

type InventoryStats = {
  totalProducts: number;
  inventoryValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  categories: number;
  suppliers: number;
  pendingOrders: number;
  recentProducts: ProductWithRelations[];
};

export default function InventoryPage() {
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    inventoryValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    categories: 0,
    suppliers: 0,
    pendingOrders: 0,
    recentProducts: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInventoryStats();
  }, []);

  const fetchInventoryStats = async () => {
    try {
      const response = await fetch("/api/inventory/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch inventory stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<ProductWithRelations>[] = [
    { id: "sku", header: "SKU", accessorKey: "sku", sortable: true },
    { id: "name", header: "Product Name", accessorKey: "name", sortable: true },
    { 
      id: "category", 
      header: "Category", 
      cell: (row) => row.category?.name || "—"
    },
    {
      id: "stockLevel",
      header: "Stock",
      cell: (row) => (
        <StockLevelCell 
          current={row.stockLevel} 
          minimum={row.reorderPoint} 
        />
      ),
      sortable: true,
    },
    {
      id: "costPrice",
      header: "Cost",
      cell: (row) => <CurrencyCell value={Number(row.costPrice)} />,
    },
    {
      id: "sellingPrice",
      header: "Price",
      cell: (row) => <CurrencyCell value={Number(row.sellingPrice)} />,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => {
        const status = (row as any).status;
        return (
          <Badge variant={status.variant === "warning" ? "secondary" : status.variant}>
            {status.label}
          </Badge>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Inventory Management"
          description="Manage products, stock levels, and purchase orders"
        >
          <AIInsightsButton module="inventory" />
        </PageHeader>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading inventory data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Management"
        description="Manage products, stock levels, and purchase orders"
      >
        <div className="flex gap-2">
          <AIInsightsButton module="inventory" />
          <Button asChild>
            <Link href="/inventory/products/new">
              <Package className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">active products</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inventory Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.inventoryValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">at cost price</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Low Stock
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">need reorder</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Out of Stock
            </CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.outOfStockCount}</div>
            <p className="text-xs text-muted-foreground">products unavailable</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/inventory/products">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">Manage product catalog</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/inventory/categories">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Boxes className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.categories}</div>
              <p className="text-xs text-muted-foreground">Product categories</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/inventory/suppliers">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.suppliers}</div>
              <p className="text-xs text-muted-foreground">Active suppliers</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/inventory/orders">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Purchase Orders</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">Pending orders</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Products Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Products</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/inventory/products">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            data={stats.recentProducts}
            columns={columns}
            searchPlaceholder="Search products..."
            emptyMessage="No products found."
          />
        </CardContent>
      </Card>
    </div>
  );
}
