import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Edit } from "lucide-react";

interface ExpenseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ExpenseDetailPage({ params }: ExpenseDetailPageProps) {
  const { id } = await params;
  
  const expense = await prisma.expense.findUnique({
    where: { id },
    include: {
      employee: true,
    },
  });

  if (!expense) {
    notFound();
  }

  const statusColors = {
    PENDING: "default",
    APPROVED: "default",
    REJECTED: "destructive",
  } as const;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expense Details"
        description="View expense information"
        backHref="/finance/expenses"
      >
        <Link href={`/finance/expenses/${expense.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Expense
          </Button>
        </Link>
      </PageHeader>

      <Card className="p-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Employee</p>
            <p className="font-medium">
              {expense.employee.firstName} {expense.employee.lastName}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Category</p>
            <Badge>{expense.category}</Badge>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="font-medium text-lg">${expense.amount.toNumber().toLocaleString()}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Expense Date</p>
            <p className="font-medium">
              {new Date(expense.expenseDate).toLocaleDateString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge variant={statusColors[expense.status as keyof typeof statusColors]}>
              {expense.status}
            </Badge>
          </div>

          {expense.receiptUrl && (
            <div>
              <p className="text-sm text-muted-foreground">Receipt</p>
              <a
                href={expense.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View Receipt
              </a>
            </div>
          )}

          <div className="col-span-2">
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="font-medium">{expense.description}</p>
          </div>

          {expense.notes && (
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="font-medium">{expense.notes}</p>
            </div>
          )}

          <div className="col-span-2 pt-4 border-t">
            <p className="text-sm text-muted-foreground">Submitted</p>
            <p className="font-medium">
              {new Date(expense.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
