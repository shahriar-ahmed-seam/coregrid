import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { DealForm } from "../../deal-form";
import { PageHeader } from "@/components/layout/page-header";

export default async function EditDealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [deal, customers, salesReps] = await Promise.all([
    prisma.deal.findUnique({
      where: { id },
    }),
    prisma.customer.findMany({
      orderBy: { companyName: "asc" },
    }),
    prisma.employee.findMany({
      where: { status: "ACTIVE" },
      orderBy: { firstName: "asc" },
    }),
  ]);

  if (!deal) {
    notFound();
  }

  // Serialize Decimal to number
  const serializedDeal = {
    ...deal,
    value: deal.value.toNumber(),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Deal"
        description={`Update deal information for ${deal.title}`}
        backHref={`/crm/deals/${deal.id}`}
      />

      <DealForm deal={serializedDeal} customers={customers} salesReps={salesReps} />
    </div>
  );
}
