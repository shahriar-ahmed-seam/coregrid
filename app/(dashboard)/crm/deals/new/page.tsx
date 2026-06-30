import prisma from "@/lib/prisma";
import { DealForm } from "../deal-form";
import { PageHeader } from "@/components/layout/page-header";

export default async function NewDealPage() {
  const [customers, salesReps] = await Promise.all([
    prisma.customer.findMany({
      orderBy: { companyName: "asc" },
    }),
    prisma.employee.findMany({
      where: { status: "ACTIVE" },
      orderBy: { firstName: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Deal"
        description="Add a new deal to your pipeline"
        backHref="/crm/deals"
      />

      <DealForm customers={customers} salesReps={salesReps} />
    </div>
  );
}
