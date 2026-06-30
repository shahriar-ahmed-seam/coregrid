import prisma from "@/lib/prisma";
import { Invoice, Customer } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InvoicesTable, InvoiceWithCustomer } from "./invoices-table";
import { PageHeader } from "@/components/layout/page-header";
import { Plus } from "lucide-react";


export default async function InvoicesPage() {
  const invoicesRaw = await prisma.invoice.findMany({
    include: {
      customer: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialize Decimal fields
  const invoices: InvoiceWithCustomer[] = invoicesRaw.map((invoice) => ({
    ...invoice,
    subtotal: invoice.subtotal.toNumber(),
    taxAmount: invoice.taxAmount.toNumber(),
    discount: invoice.discount.toNumber(),
    total: invoice.total.toNumber(),
    taxRate: invoice.taxRate.toNumber(),
    customer: invoice.customer,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Manage customer invoices"
        backHref="/finance"
      >
        <Link href="/finance/invoices/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </Link>
      </PageHeader>

      <InvoicesTable invoices={invoices} />
    </div>
  );
}
