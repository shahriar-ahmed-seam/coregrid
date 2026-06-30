import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { LeaveRequestsTable } from "./leave-requests-table";
import prisma from "@/lib/prisma";

export default async function LeaveRequestsPage() {
  const leaveRequestsRaw = await prisma.leaveRequest.findMany({
    include: {
      employee: true,
      approver: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const leaveRequests = leaveRequestsRaw.map(req => ({
    ...req,
    employee: req.employee ? {
      ...req.employee,
      salary: req.employee.salary.toNumber(),
    } : null,
    approver: req.approver ? {
      ...req.approver,
      salary: req.approver.salary.toNumber(),
    } : null,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Requests"
        description="Manage employee leave requests"
        backHref="/hr"
        action={
          <Button asChild>
            <Link href="/hr/leave-requests/new">
              <Plus className="mr-2 h-4 w-4" />
              New Leave Request
            </Link>
          </Button>
        }
      />

      <LeaveRequestsTable leaveRequests={leaveRequests} />
    </div>
  );
}
