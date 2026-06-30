import prisma from "@/lib/prisma";
import { ExpenseForm } from "../../expense-form";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";

interface EditExpensePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditExpensePage({ params }: EditExpensePageProps) {
  const { id } = await params;
  
  const [expense, employees] = await Promise.all([
    prisma.expense.findUnique({
      where: { id },
    }),
    prisma.employee.findMany({
      where: { status: "ACTIVE" },
      orderBy: { firstName: "asc" },
    }),
  ]);

  if (!expense) {
    notFound();
  }

  const expenseWithNumber = {
    ...expense,
    amount: expense.amount.toNumber(),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Expense"
        description="Update expense information"
        backHref={`/finance/expenses/${id}`}
      />

      <ExpenseForm expense={expenseWithNumber} employees={employees} />
    </div>
  );
}
