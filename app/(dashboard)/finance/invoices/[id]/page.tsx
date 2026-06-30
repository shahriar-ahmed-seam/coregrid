import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Edit } from "lucide-react";

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = await params;
  
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      items: true,
    },
  });

  if (!invoice) {
    notFound();
  }

  const statusColors = {
    DRAFT: "secondary",
    PENDING: "default",
    PAID: "default",
    OVERDUE: "destructive",
    CANCELLED: "secondary",
  } as const;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Invoice ${invoice.invoiceNumber}`}
        description="View invoice details"
        backHref="/finance/invoices"
      >
        <Link href={`/finance/invoices/${invoice.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Invoice
          </Button>
        </Link>
      </PageHeader>

      <Card className="p-6">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Customer</p>
            <p className="font-medium">{invoice.customer.companyName}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge variant={statusColors[invoice.status as keyof typeof statusColors]}>
              {invoice.status}
            </Badge>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Issue Date</p>
            <p className="font-medium">
              {new Date(invoice.issueDate).toLocaleDateString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Due Date</p>
            <p className="font-medium">
              {new Date(invoice.dueDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">Invoice Items</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Description</th>
                <th className="text-right py-2">Quantity</th>
                <th className="text-right py-2">Unit Price</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2">{item.description}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">${item.unitPrice.toNumber().toFixed(2)}</td>
                  <td className="text-right">${item.total.toNumber().toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 space-y-2 max-w-xs ml-auto">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium">${invoice.subtotal.toNumber().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax ({invoice.taxRate.toNumber()}%):</span>
              <span className="font-medium">${invoice.taxAmount.toNumber().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount:</span>
              <span className="font-medium">-${invoice.discount.toNumber().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total:</span>
              <span>${invoice.total.toNumber().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="border-t pt-6 mt-6">
            <p className="text-sm text-muted-foreground mb-2">Notes</p>
            <p>{invoice.notes}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
