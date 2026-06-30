import prisma from "@/lib/prisma";
import { Expense, Employee } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExpensesTable } from "./expenses-table";
import { PageHeader } from "@/components/layout/page-header";
import { Plus } from "lucide-react";

type ExpenseWithEmployee = Omit<Expense, "amount"> & {
  amount: number;
  employee: Employee;
};

export default async function ExpensesPage() {
  const expensesRaw = await prisma.expense.findMany({
    include: {
      employee: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialize Decimal fields
  const expenses: ExpenseWithEmployee[] = expensesRaw.map((expense) => ({
    ...expense,
    amount: expense.amount.toNumber(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Track and approve business expenses"
        backHref="/finance"
      >
        <Link href="/finance/expenses/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Submit Expense
          </Button>
        </Link>
      </PageHeader>

      <ExpensesTable expenses={expenses} />
    </div>
  );
}
