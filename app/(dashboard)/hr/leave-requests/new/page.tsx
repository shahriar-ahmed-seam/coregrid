import { PageHeader } from "@/components/layout/page-header";
import prisma from "@/lib/prisma";
import { LeaveRequestForm } from "../leave-request-form";

export default async function NewLeaveRequestPage() {
  const employeesRaw = await prisma.employee.findMany({
    where: { status: "ACTIVE" },
    orderBy: { firstName: "asc" },
  });

  const employees = employeesRaw.map(emp => ({
    ...emp,
    salary: emp.salary.toNumber(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Leave Request"
        description="Submit a new leave request"
        backHref="/hr/leave-requests"
      />

      <LeaveRequestForm employees={employees} />
    </div>
  );
}
