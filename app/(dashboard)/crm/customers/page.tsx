import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { CustomersTable } from "./customers-table";
import prisma from "@/lib/prisma";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    include: {
      _count: {
        select: {
          contacts: true,
          deals: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Manage customer accounts and relationships"
        backHref="/crm"
        action={
          <Button asChild>
            <Link href="/crm/customers/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Link>
          </Button>
        }
      />

      <CustomersTable customers={customers} />
    </div>
  );
}
