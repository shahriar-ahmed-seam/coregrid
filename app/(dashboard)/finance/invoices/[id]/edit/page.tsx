import prisma from "@/lib/prisma";
import { InvoiceForm } from "../../invoice-form";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";

interface EditInvoicePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditInvoicePage({ params }: EditInvoicePageProps) {
  const { id } = await params;
  
  const [invoice, customers] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    }),
    prisma.customer.findMany({
      orderBy: { companyName: "asc" },
    }),
  ]);

  if (!invoice) {
    notFound();
  }

  const invoiceWithNumbers = {
    ...invoice,
    subtotal: invoice.subtotal.toNumber(),
    taxAmount: invoice.taxAmount.toNumber(),
    discount: invoice.discount.toNumber(),
    total: invoice.total.toNumber(),
    taxRate: invoice.taxRate.toNumber(),
    items: invoice.items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toNumber(),
    })),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Invoice"
        description="Update invoice information"
        backHref={`/finance/invoices/${id}`}
      />

      <InvoiceForm invoice={invoiceWithNumbers} customers={customers} />
    </div>
  );
}
