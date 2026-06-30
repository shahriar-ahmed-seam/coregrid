import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { aiAssistant } from "@/lib/ai/ollama";
import prisma from "@/lib/prisma";
import { z } from "zod";

const analyzeSchema = z.object({
  module: z.enum(["sales", "inventory", "hr", "finance", "projects"]),
});

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = analyzeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid module specified" },
        { status: 400 }
      );
    }

    const { module } = validationResult.data;

    let result;

    switch (module) {
      case "sales": {
        // Gather sales data from SaleItem (since Sale doesn't have direct product relation)
        const [salesData, topProductData] = await Promise.all([
          prisma.sale.aggregate({
            _sum: { total: true },
            _count: true,
            _avg: { total: true },
          }),
          prisma.saleItem.groupBy({
            by: ["productId"],
            _sum: { total: true },
            orderBy: { _sum: { total: "desc" } },
            take: 5,
          }),
        ]);

        // Get product names for top products
        const productIds = topProductData.map((p) => p.productId);
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true },
        });

        const topProductsWithNames = topProductData.map((p) => ({
          name: products.find((prod) => prod.id === p.productId)?.name || "Unknown",
          revenue: Number(p._sum?.total) || 0,
        }));

        result = await aiAssistant.analyzeSales(session.user.id, {
          totalRevenue: Number(salesData._sum.total) || 0,
          salesCount: salesData._count || 0,
          averageOrderValue: Number(salesData._avg.total) || 0,
          topProducts: topProductsWithNames,
          recentTrend: "stable", // Would calculate from historical data
        });
        break;
      }

      case "inventory": {
        // Gather inventory data with correct field names
        const products = await prisma.product.findMany({
          select: {
            name: true,
            stockLevel: true,
            reorderPoint: true,
            sellingPrice: true,
          },
        });

        const lowStockItems = products
          .filter((p) => p.stockLevel <= p.reorderPoint && p.stockLevel > 0)
          .map((p) => ({
            name: p.name,
            quantity: p.stockLevel,
            reorderPoint: p.reorderPoint,
          }));

        const totalValue = products.reduce(
          (sum, p) => sum + Number(p.sellingPrice) * p.stockLevel,
          0
        );

        result = await aiAssistant.analyzeInventory(session.user.id, {
          totalProducts: products.length,
          lowStockItems: lowStockItems.slice(0, 10),
          overStockItems: [], // Would calculate based on sales velocity
          inventoryValue: totalValue,
        });
        break;
      }

      case "hr": {
        // Gather HR data
        const [employees, departments, leaveRequests] = await Promise.all([
          prisma.employee.findMany({
            select: {
              status: true,
              hireDate: true,
              department: { select: { name: true } },
            },
          }),
          prisma.department.findMany({
            include: { _count: { select: { employees: true } } },
          }),
          prisma.leaveRequest.count({
            where: { status: "PENDING" },
          }),
        ]);

        const departmentDistribution: Record<string, number> = {};
        departments.forEach((d) => {
          departmentDistribution[d.name] = d._count.employees;
        });

        const employeesByStatus: Record<string, number> = {};
        employees.forEach((e) => {
          employeesByStatus[e.status] = (employeesByStatus[e.status] || 0) + 1;
        });

        // Calculate average tenure
        const now = new Date();
        const avgTenure =
          employees.reduce((sum, e) => {
            const years = (now.getTime() - new Date(e.hireDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
            return sum + years;
          }, 0) / (employees.length || 1);

        result = await aiAssistant.analyzeHR(session.user.id, {
          totalEmployees: employees.length,
          departmentDistribution,
          pendingLeaveRequests: leaveRequests,
          employeesByStatus,
          avgTenure,
        });
        break;
      }

      case "finance": {
        // Gather finance data
        const [salesTotal, expensesData, invoiceData] = await Promise.all([
          prisma.sale.aggregate({ _sum: { total: true } }),
          prisma.expense.groupBy({
            by: ["category"],
            _sum: { amount: true },
          }),
          prisma.invoice.findMany({
            select: { status: true, total: true },
          }),
        ]);

        const totalRevenue = Number(salesTotal._sum.total) || 0;
        const totalExpenses = expensesData.reduce(
          (sum, e) => sum + Number(e._sum.amount || 0),
          0
        );

        const expensesByCategory: Record<string, number> = {};
        expensesData.forEach((e) => {
          expensesByCategory[e.category] = Number(e._sum.amount) || 0;
        });

        const outstandingInvoices = invoiceData.filter(
          (i) => i.status !== "PAID" && i.status !== "CANCELLED"
        ).length;

        const overdueAmount = invoiceData
          .filter((i) => i.status === "OVERDUE")
          .reduce((sum, i) => sum + Number(i.total), 0);

        result = await aiAssistant.analyzeFinance(session.user.id, {
          totalRevenue,
          totalExpenses,
          netProfit: totalRevenue - totalExpenses,
          outstandingInvoices,
          overdueAmount,
          expensesByCategory,
        });
        break;
      }

      case "projects": {
        // Gather project data
        const [projects, tasks] = await Promise.all([
          prisma.project.findMany({
            select: { 
              status: true,
              tasks: {
                select: { status: true }
              }
            },
          }),
          prisma.task.findMany({
            select: { status: true, dueDate: true },
          }),
        ]);

        const projectsByStatus: Record<string, number> = {};
        projects.forEach((p) => {
          projectsByStatus[p.status] = (projectsByStatus[p.status] || 0) + 1;
        });

        // Calculate average progress based on completed tasks
        const projectProgresses = projects.map((p) => {
          const total = p.tasks.length;
          const completed = p.tasks.filter((t) => t.status === "COMPLETED").length;
          return total > 0 ? (completed / total) * 100 : 0;
        });
        const avgProgress = projectProgresses.length > 0
          ? projectProgresses.reduce((a, b) => a + b, 0) / projectProgresses.length
          : 0;

        const now = new Date();
        const overdueTasks = tasks.filter(
          (t) => t.status !== "COMPLETED" && t.dueDate && new Date(t.dueDate) < now
        ).length;

        result = await aiAssistant.analyzeProjects(session.user.id, {
          totalProjects: projects.length,
          projectsByStatus,
          overdueTasks,
          avgProjectProgress: avgProgress,
          teamUtilization: 75, // Would calculate from actual data
        });
        break;
      }

      default:
        return NextResponse.json(
          { error: "Invalid module" },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Analysis failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      analysis: result.data,
      tokensUsed: result.tokensUsed,
      duration: result.duration,
    });
  } catch (error) {
    console.error("AI analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze data" },
      { status: 500 }
    );
  }
}
