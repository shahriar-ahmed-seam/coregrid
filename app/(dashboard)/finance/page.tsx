import prisma from "@/lib/prisma";
import { requireRole, RBAC } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";
import { DollarSign, FileText, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";

async function getFinanceStats() {
  const [invoices, expenses] = await Promise.all([
    prisma.invoice.findMany({
      select: {
        status: true,
        total: true,
      },
    }),
    prisma.expense.findMany({
      select: {
        amount: true,
        status: true,
      },
    }),
  ]);

  const totalRevenue = invoices
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + i.total.toNumber(), 0);

  const pendingInvoices = invoices.filter((i) => i.status === "PENDING").length;

  const totalExpenses = expenses
    .filter((e) => e.status === "APPROVED")
    .reduce((sum, e) => sum + e.amount.toNumber(), 0);

  const pendingExpenses = expenses.filter((e) => e.status === "PENDING").length;

  const profit = totalRevenue - totalExpenses;

  return {
    totalRevenue,
    pendingInvoices,
    totalExpenses,
    pendingExpenses,
    profit,
  };
}

export default async function FinancePage() {
  await requireRole(RBAC.FINANCE);
  
  const stats = await getFinanceStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Finance</h1>
        <p className="text-muted-foreground">
          Manage invoices, expenses, and financial reports
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </p>
              <p className="text-2xl font-bold">
                ${stats.totalRevenue.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Pending Invoices
              </p>
              <p className="text-2xl font-bold">{stats.pendingInvoices}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Expenses
              </p>
              <p className="text-2xl font-bold">
                ${stats.totalExpenses.toLocaleString()}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Net Profit
              </p>
              <p className={`text-2xl font-bold ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${stats.profit.toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/finance/invoices">
          <Card className="p-6 hover:bg-accent transition-colors cursor-pointer">
            <FileText className="h-8 w-8 mb-3 text-primary" />
            <h3 className="font-semibold text-lg mb-1">Invoices</h3>
            <p className="text-sm text-muted-foreground">
              Create and manage customer invoices
            </p>
          </Card>
        </Link>

        <Link href="/finance/expenses">
          <Card className="p-6 hover:bg-accent transition-colors cursor-pointer">
            <TrendingDown className="h-8 w-8 mb-3 text-primary" />
            <h3 className="font-semibold text-lg mb-1">Expenses</h3>
            <p className="text-sm text-muted-foreground">
              Track and approve business expenses
            </p>
          </Card>
        </Link>

        <Link href="/finance/reports">
          <Card className="p-6 hover:bg-accent transition-colors cursor-pointer">
            <DollarSign className="h-8 w-8 mb-3 text-primary" />
            <h3 className="font-semibold text-lg mb-1">Reports</h3>
            <p className="text-sm text-muted-foreground">
              View financial reports and analytics
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
