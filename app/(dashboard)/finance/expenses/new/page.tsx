import prisma from "@/lib/prisma";
import { ExpenseForm } from "../expense-form";
import { PageHeader } from "@/components/layout/page-header";

export default async function NewExpensePage() {
  const employees = await prisma.employee.findMany({
    where: { status: "ACTIVE" },
    orderBy: { firstName: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Submit Expense"
        description="Submit a new expense for approval"
        backHref="/finance/expenses"
      />

      <ExpenseForm employees={employees} />
    </div>
  );
}
