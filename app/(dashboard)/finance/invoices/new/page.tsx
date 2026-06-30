import prisma from "@/lib/prisma";
import { InvoiceForm } from "../invoice-form";
import { PageHeader } from "@/components/layout/page-header";

export default async function NewInvoicePage() {
  const customers = await prisma.customer.findMany({
    orderBy: { companyName: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Invoice"
        description="Create a new invoice for a customer"
        backHref="/finance/invoices"
      />

      <InvoiceForm customers={customers} />
    </div>
  );
}
