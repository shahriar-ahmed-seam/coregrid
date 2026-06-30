import prisma from "@/lib/prisma";
import { EmployeeStatus, Deal, Customer, Contact, UserRole } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DealsTable } from "./deals-table";
import { PageHeader } from "@/components/layout/page-header";
import { Plus } from "lucide-react";

type DealWithRelations = Omit<Deal, "value"> & {
  value: number;
  customer: Customer;
  contact: Contact | null;
  salesRep: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    status: EmployeeStatus;
    position: string;
    employeeId: string;
    createdAt: Date;
    updatedAt: Date;
  };
};


export default async function DealsPage() {
  const dealsRaw = await prisma.deal.findMany({
    include: {
      customer: true,
      contact: true,
      salesRep: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          employeeId: true,
          status: true,
          position: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialize Decimal to number

const deals = dealsRaw.map(deal => ({
  ...deal,
  value: deal.value.toNumber(), // Decimal -> number
  salesRep: {
    id: deal.salesRep.id,
    name: `${deal.salesRep.firstName} ${deal.salesRep.lastName}`,
    email: deal.salesRep.email,
    emailVerified: null,
    passwordHash: null,
    image: null,
    role: "USER" as UserRole, // set a default role
    isActive: true,
    createdAt: deal.salesRep.createdAt,
    updatedAt: deal.salesRep.updatedAt,
  },
}));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deals"
        description="Manage your sales pipeline"
        backHref="/crm"
      >
        <Link href="/crm/deals/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Deal
          </Button>
        </Link>
      </PageHeader>

      <DealsTable deals={deals} />
    </div>
  );
}
