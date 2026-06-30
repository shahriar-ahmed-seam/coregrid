import { PageHeader } from "@/components/layout/page-header";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CustomerForm } from "../../customer-form";

interface EditCustomerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCustomerPage({ params }: EditCustomerPageProps) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
  });

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Customer"
        description="Update customer information"
        backHref={`/crm/customers/${customer.id}`}
      />

      <CustomerForm customer={customer} />
    </div>
  );
}
