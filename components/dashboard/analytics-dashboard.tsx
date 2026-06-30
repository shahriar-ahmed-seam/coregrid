"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "@/components/charts/bar-chart";
import { LineChart } from "@/components/charts/line-chart";
import { PieChart } from "@/components/charts/pie-chart";
import { AreaChart } from "@/components/charts/area-chart";
import { StatsCard } from "@/components/ui/stats-card";
import {
    Users,
    Package,
    DollarSign,
    Briefcase,
    TrendingUp,
    AlertCircle,
    ShoppingCart,
    FileText,
    Activity,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardAnalytics {
    summary: {
        totalEmployees: number;
        activeEmployees: number;
        totalProducts: number;
        activeProducts: number;
        totalCustomers: number;
        totalInvoices: number;
        totalRevenue: number;
        totalProjects: number;
    };
    hr: {
        totalEmployees: number;
        activeEmployees: number;
        newThisMonth: number;
        byDepartment: { department: string; count: number }[];
    };
    inventory: {
        totalProducts: number;
        activeProducts: number;
        lowStock: number;
        outOfStock: number;
        healthScore: number;
        totalValue: number;
    };
    purchases: {
        total: number;
        pending: number;
        received: number;
        monthlyTrend: { month: string; orders: number; amount: number }[];
    };
    crm: {
        totalCustomers: number;
        leadDeals: number;
        wonDeals: number;
        conversionRate: number;
        dealsByStage: { stage: string; count: number }[];
    };
    finance: {
        invoices: {
            total: number;
            paid: number;
            pending: number;
            overdue: number;
            collectionRate: number;
        };
        expenses: {
            pending: number;
            approved: number;
        };
        revenue: number;
        monthlyTrend: { month: string; revenue: number; expenses: number }[];
    };
    projects: {
        total: number;
        active: number;
        completed: number;
        completionRate: number;
        byStatus: { status: string; count: number }[];
    };
}

export function AnalyticsDashboard() {
    const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/analytics/dashboard")
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                }
                return res.json();
            })
            .then((data) => {
                if (data.success) {
                    setAnalytics(data.data);
                } else {
                    setError(data.error || "Failed to load data");
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Dashboard fetch error:", err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(8)].map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-80" />
                    ))}
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p className="text-muted-foreground">
                        {error ? `Error: ${error}` : "Failed to load analytics data."}
                    </p>
                </CardContent>
            </Card>
        );
    }
    const formatCurrency = (value?: number) =>
        value == null ? "—" : `$${value.toLocaleString()}`;

    const formatNumber = (value?: number) =>
        value == null ? "—" : value.toLocaleString();

    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Active Employees"
                    value={analytics.hr.activeEmployees}
                    description={`${analytics.hr.newThisMonth} new this month`}
                    icon={Users}
                    trend={analytics.hr.newThisMonth > 0 ? { value: analytics.hr.newThisMonth, isPositive: true }
                        : undefined}
                />
                <StatsCard
                    title="Inventory Health"
                    value={`${analytics.inventory.healthScore}%`}
                    description={`${analytics.inventory.lowStock} low stock items`}
                    icon={Package}
                    trend={{
                        value: analytics.inventory.healthScore,
                        isPositive: analytics.inventory.healthScore >= 80,
                    }}

                />
                <StatsCard
                    title="Total Revenue"
                    value={formatCurrency(analytics.finance.revenue)}
                    description={`${analytics.finance.invoices.collectionRate}% collection rate`}
                    icon={DollarSign}
                    trend={{
                        value: analytics.finance.invoices.collectionRate,
                        isPositive: analytics.finance.invoices.collectionRate >= 50,
                    }}
                />
                <StatsCard
                    title="Active Projects"
                    value={analytics.projects.active}
                    description={`${analytics.projects.completionRate}% completion rate`}
                    icon={Briefcase}
                    trend={{
                        value: analytics.projects.completionRate,
                        isPositive: analytics.projects.completionRate >= 70,
                    }}

                />
            </div>

            {/* Secondary Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Customers"
                    value={analytics.crm.totalCustomers}
                    description={`${analytics.crm.leadDeals} lead deals`}
                    icon={Users}
                />
                <StatsCard
                    title="Purchase Orders"
                    value={analytics.purchases.total}
                    description={`${analytics.purchases.pending} pending`}
                    icon={ShoppingCart}
                />
                <StatsCard
                    title="Invoices"
                    value={analytics.finance.invoices.total}
                    description={`${analytics.finance.invoices.overdue} overdue`}
                    icon={FileText}
                    className={analytics.finance.invoices.overdue > 0 ? "border-orange-500" : ""}
                />
                <StatsCard
                    title="Out of Stock"
                    value={analytics.inventory.outOfStock}
                    description="Needs immediate attention"
                    icon={AlertCircle}
                    className={analytics.inventory.outOfStock > 0 ? "border-red-500" : ""}
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid gap-4 md:grid-cols-2">
                <LineChart
                    title="Revenue & Expenses Trend"
                    description="Last 6 months financial overview"
                    data={analytics.finance.monthlyTrend}
                    lines={[
                        { key: "revenue", name: "Revenue", color: "#10b981" },
                        { key: "expenses", name: "Expenses", color: "#ef4444" },
                    ]}
                    xAxisKey="month"
                    valueFormatter={formatCurrency}
                />

                <AreaChart
                    title="Purchase Orders Trend"
                    description="Monthly purchase order value"
                    data={analytics.purchases.monthlyTrend}
                    areas={[
                        { key: "amount", name: "Order Value", color: "#3b82f6" },
                    ]}
                    xAxisKey="month"
                    valueFormatter={formatCurrency}
                />
            </div>

            {/* Charts Row 2 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <BarChart
                    title="Employees by Department"
                    description="Workforce distribution"
                    data={analytics.hr.byDepartment}
                    dataKeys={[
                        { key: "count", name: "Employees", color: "#8b5cf6" },
                    ]}
                    xAxisKey="department"
                    valueFormatter={formatNumber}
                />

                <PieChart
                    title="Deal Stage Distribution"
                    description="Sales pipeline breakdown"
                    data={analytics.crm.dealsByStage.map((d) => ({
                        name: d.stage.replace(/_/g, " "),
                        value: d.count,
                    }))}
                    colors={["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#6366f1"]}
                />

                <PieChart
                    title="Project Status"
                    description="Active project distribution"
                    data={analytics.projects.byStatus.map((p) => ({
                        name: p.status.replace("_", " "),
                        value: p.count,
                    }))}
                    colors={["#6366f1", "#8b5cf6", "#10b981", "#f59e0b"]}
                />
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Inventory Alerts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Low Stock</span>
                            <span className="font-bold text-orange-600">
                                {analytics.inventory.lowStock}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Out of Stock</span>
                            <span className="font-bold text-red-600">
                                {analytics.inventory.outOfStock}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t">
                            <span className="text-sm text-muted-foreground">Health Score</span>
                            <span className="font-bold text-green-600">
                                {analytics.inventory.healthScore}%
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Finance Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Paid Invoices</span>
                            <span className="font-bold text-green-600">
                                {analytics.finance.invoices.paid}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Pending</span>
                            <span className="font-bold text-orange-600">
                                {analytics.finance.invoices.pending}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Overdue</span>
                            <span className="font-bold text-red-600">
                                {analytics.finance.invoices.overdue}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">CRM Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Total Customers</span>
                            <span className="font-bold">{analytics.crm.totalCustomers}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Lead Deals</span>
                            <span className="font-bold">{analytics.crm.leadDeals}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Won Deals</span>
                            <span className="font-bold text-green-600">{analytics.crm.wonDeals}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t">
                            <span className="text-sm text-muted-foreground">Conversion Rate</span>
                            <span className="font-bold text-green-600">
                                {analytics.crm.conversionRate}%
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
