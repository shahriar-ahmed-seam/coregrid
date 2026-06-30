import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);
    const startOfLastMonth = startOfMonth(subMonths(now, 1));
    const endOfLastMonth = endOfMonth(subMonths(now, 1));

    // Get date range for last 6 months for charts
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(now, 5 - i);
      return {
        month: format(date, "MMM yyyy"),
        startDate: startOfMonth(date),
        endDate: endOfMonth(date),
      };
    });

    // Parallel data fetching for performance
    const [
      // Employee Analytics
      totalEmployees,
      activeEmployees,
      employeesByDepartment,
      newEmployeesThisMonth,
      
      // Inventory Analytics
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      totalStockValue,
      
      // Purchase Orders Analytics
      totalPurchaseOrders,
      pendingOrders,
      receivedOrders,
      monthlyPurchases,
      
      // Customer Analytics
      totalCustomers,
      leadDeals,
      wonDeals,
      dealsByStage,
      
      // Finance Analytics
      totalInvoices,
      paidInvoices,
      sentInvoices,
      overdueInvoices,
      totalRevenue,
      pendingExpenses,
      approvedExpenses,
      monthlyRevenue,
      
      // Project Analytics
      totalProjects,
      activeProjects,
      completedProjects,
      projectsByStatus,
    ] = await Promise.all([
      // Employee queries
      prisma.employee.count(),
      prisma.employee.count({ where: { status: "ACTIVE" } }),
      prisma.employee.groupBy({
        by: ["departmentId"],
        _count: { id: true },
      }).then(async (groups) => {
        // Fetch department names
        const deptIds = groups.map(g => g.departmentId);
        const departments = await prisma.department.findMany({
          where: { id: { in: deptIds } },
          select: { id: true, name: true },
        });
        const deptMap = new Map(departments.map(d => [d.id, d.name]));
        return groups.map(g => ({
          department: deptMap.get(g.departmentId) || "Unknown",
          departmentId: g.departmentId,
          _count: g._count,
        })).sort((a, b) => b._count.id - a._count.id);
      }),
      prisma.employee.count({
        where: {
          createdAt: {
            gte: startOfCurrentMonth,
            lte: endOfCurrentMonth,
          },
        },
      }),
      
      // Inventory queries
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      // Low stock count - products where stockLevel <= reorderPoint
      prisma.product.findMany({
        where: { isActive: true },
        select: { stockLevel: true, reorderPoint: true }
      }).then(products => products.filter(p => p.stockLevel <= p.reorderPoint).length),
      prisma.product.count({
        where: {
          stockLevel: 0,
          isActive: true,
        },
      }),
      prisma.product.aggregate({
        _sum: {
          stockLevel: true,
        },
        where: { isActive: true },
      }),
      
      // Purchase Order queries
      prisma.purchaseOrder.count(),
      prisma.purchaseOrder.count({ where: { status: "ORDERED" } }),
      prisma.purchaseOrder.count({ where: { status: "RECEIVED" } }),
      Promise.all(
        last6Months.map(async ({ month, startDate, endDate }) => ({
          month,
          count: await prisma.purchaseOrder.count({
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          }),
          total: (await prisma.purchaseOrder.aggregate({
            _sum: { total: true },
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          }))._sum.total || 0,
        }))
      ),
      
      // Customer & Deal queries
      prisma.customer.count(),
      prisma.deal.count({ where: { stage: "LEAD" } }),
      prisma.deal.count({ where: { stage: "CLOSED_WON" } }),
      prisma.deal.groupBy({
        by: ["stage"],
        _count: { id: true },
      }),
      
      // Finance queries
      prisma.invoice.count(),
      prisma.invoice.count({ where: { status: "PAID" } }),
      prisma.invoice.count({ where: { status: "SENT" } }),
      prisma.invoice.count({ where: { status: "OVERDUE" } }),
      prisma.invoice.aggregate({
        _sum: { total: true },
        where: { status: "PAID" },
      }),
      prisma.expense.count({ where: { status: "PENDING" } }),
      prisma.expense.count({ where: { status: "APPROVED" } }),
      Promise.all(
        last6Months.map(async ({ month, startDate, endDate }) => ({
          month,
          revenue: Number((await prisma.invoice.aggregate({
            _sum: { total: true },
            where: {
              status: "PAID",
              paidDate: {
                gte: startDate,
                lte: endDate,
              },
            },
          }))._sum.total || 0),
          expenses: Number((await prisma.expense.aggregate({
            _sum: { amount: true },
            where: {
              status: "APPROVED",
              expenseDate: {
                gte: startDate,
                lte: endDate,
              },
            },
          }))._sum.amount || 0),
        }))
      ),
      
      // Project queries
      prisma.project.count(),
      prisma.project.count({ where: { status: "ACTIVE" } }),
      prisma.project.count({ where: { status: "COMPLETED" } }),
      prisma.project.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
    ]);

    // Calculate metrics
    const inventoryHealth = totalProducts > 0 
      ? Math.round(((totalProducts - lowStockProducts) / totalProducts) * 100)
      : 100;

    const totalDeals = leadDeals + wonDeals;
    const conversionRate = totalDeals > 0
      ? Math.round((wonDeals / totalDeals) * 100)
      : 0;

    const collectionRate = totalInvoices > 0
      ? Math.round((paidInvoices / totalInvoices) * 100)
      : 0;

    const projectCompletionRate = totalProjects > 0
      ? Math.round((completedProjects / totalProjects) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        // Summary stats
        summary: {
          totalEmployees,
          activeEmployees,
          totalProducts,
          activeProducts,
          totalCustomers,
          totalInvoices,
          totalRevenue: Number(totalRevenue._sum.total || 0),
          totalProjects,
        },
        
        // HR Analytics
        hr: {
          totalEmployees,
          activeEmployees,
          newThisMonth: newEmployeesThisMonth,
          byDepartment: employeesByDepartment.map(d => ({
            department: d.department,
            count: d._count.id,
          })),
        },
        
        // Inventory Analytics
        inventory: {
          totalProducts,
          activeProducts,
          lowStock: lowStockProducts,
          outOfStock: outOfStockProducts,
          healthScore: inventoryHealth,
          totalValue: Number(totalStockValue._sum.stockLevel || 0),
        },
        
        // Purchase Orders
        purchases: {
          total: totalPurchaseOrders,
          pending: pendingOrders,
          received: receivedOrders,
          monthlyTrend: monthlyPurchases.map(m => ({
            month: m.month,
            orders: m.count,
            amount: Number(m.total),
          })),
        },
        
        // CRM Analytics
        crm: {
          totalCustomers,
          leadDeals,
          wonDeals,
          conversionRate,
          dealsByStage: dealsByStage.map(d => ({
            stage: d.stage,
            count: d._count.id,
          })),
        },
        
        // Finance Analytics
        finance: {
          invoices: {
            total: totalInvoices,
            paid: paidInvoices,
            pending: sentInvoices,
            overdue: overdueInvoices,
            collectionRate,
          },
          expenses: {
            pending: pendingExpenses,
            approved: approvedExpenses,
          },
          revenue: Number(totalRevenue._sum.total || 0),
          monthlyTrend: monthlyRevenue,
        },
        
        // Project Analytics
        projects: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects,
          completionRate: projectCompletionRate,
          byStatus: projectsByStatus.map(p => ({
            status: p.status,
            count: p._count.id,
          })),
        },
      },
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
