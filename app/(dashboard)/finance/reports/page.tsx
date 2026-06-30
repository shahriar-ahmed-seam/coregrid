import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";

async function getFinancialReports() {
  const [invoices, expenses] = await Promise.all([
    prisma.invoice.findMany({
      select: {
        status: true,
        total: true,
        issueDate: true,
      },
    }),
    prisma.expense.findMany({
      select: {
        amount: true,
        status: true,
        expenseDate: true,
        category: true,
      },
    }),
  ]);

  // Current month calculations
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const monthlyRevenue = invoices
    .filter((i) => i.status === "PAID" && new Date(i.issueDate) >= startOfMonth && new Date(i.issueDate) <= endOfMonth)
    .reduce((sum, i) => sum + i.total.toNumber(), 0);

  const monthlyExpenses = expenses
    .filter((e) => e.status === "APPROVED" && new Date(e.expenseDate) >= startOfMonth && new Date(e.expenseDate) <= endOfMonth)
    .reduce((sum, e) => sum + e.amount.toNumber(), 0);

  // Total calculations
  const totalRevenue = invoices
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + i.total.toNumber(), 0);

  const totalExpenses = expenses
    .filter((e) => e.status === "APPROVED")
    .reduce((sum, e) => sum + e.amount.toNumber(), 0);

  // Expenses by category
  const expensesByCategory = expenses
    .filter((e) => e.status === "APPROVED")
    .reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount.toNumber();
      return acc;
    }, {} as Record<string, number>);

  return {
    monthlyRevenue,
    monthlyExpenses,
    monthlyProfit: monthlyRevenue - monthlyExpenses,
    totalRevenue,
    totalExpenses,
    totalProfit: totalRevenue - totalExpenses,
    expensesByCategory,
  };
}

export default async function ReportsPage() {
  const reports = await getFinancialReports();
  const now = new Date();
  const monthName = now.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Financial Reports</h1>
        <p className="text-muted-foreground">
          View financial analytics and performance metrics
        </p>
      </div>

      {/* Monthly Report */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {monthName} Report
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Monthly Revenue
                </p>
                <p className="text-2xl font-bold">
                  ${reports.monthlyRevenue.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Monthly Expenses
                </p>
                <p className="text-2xl font-bold">
                  ${reports.monthlyExpenses.toLocaleString()}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Monthly Profit
                </p>
                <p className={`text-2xl font-bold ${reports.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${reports.monthlyProfit.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </Card>
        </div>
      </div>

      {/* All-Time Report */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All-Time Summary</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold">
                  ${reports.totalRevenue.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Expenses
                </p>
                <p className="text-2xl font-bold">
                  ${reports.totalExpenses.toLocaleString()}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Profit
                </p>
                <p className={`text-2xl font-bold ${reports.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${reports.totalProfit.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </Card>
        </div>
      </div>

      {/* Expenses by Category */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Expenses by Category</h2>
        <div className="space-y-4">
          {Object.entries(reports.expensesByCategory).map(([category, amount]) => (
            <div key={category} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="font-medium">{category}</span>
              </div>
              <span className="font-bold">${amount.toLocaleString()}</span>
            </div>
          ))}
          {Object.keys(reports.expensesByCategory).length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              No expense data available
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
