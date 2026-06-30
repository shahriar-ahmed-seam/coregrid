"use client";

import { LeaveRequest, Employee } from "@prisma/client";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { DateCell } from "@/components/ui/data-table-cells";

type LeaveRequestWithRelations = LeaveRequest & {
  employee: (Omit<Employee, 'salary'> & { salary: number }) | null;
  approver: (Omit<Employee, 'salary'> & { salary: number }) | null;
};

interface LeaveRequestsTableProps {
  leaveRequests: LeaveRequestWithRelations[];
}

export function LeaveRequestsTable({ leaveRequests }: LeaveRequestsTableProps) {
  const columns: Column<LeaveRequestWithRelations>[] = [
    {
      id: "employee",
      header: "Employee",
      cell: (row) => {
        const emp = row.employee;
        if (!emp) return "N/A";
        return (
          <div>
            <div className="font-medium">
              {emp.firstName} {emp.lastName}
            </div>
            <div className="text-xs text-muted-foreground">{emp.employeeId}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "leaveType",
      header: "Type",
      cell: (row) => {
        const type = row.leaveType;
        const colors: Record<string, string> = {
          ANNUAL: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
          SICK: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
          PERSONAL: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
          MATERNITY: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
          PATERNITY: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
          UNPAID: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
        };
        return (
          <Badge variant="secondary" className={colors[type] || colors.ANNUAL}>
            {type.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: (row) => <DateCell value={row.startDate} />,
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: (row) => <DateCell value={row.endDate} />,
    },
    {
      id: "duration",
      header: "Days",
      cell: (row) => row.days,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (row) => {
        const status = row.status;
        const colors = {
          PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
          APPROVED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
          CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
        };
        return (
          <Badge variant="secondary" className={colors[status]}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "approver",
      header: "Approver",
      cell: (row) => {
        const approver = row.approver;
        return approver ? `${approver.firstName} ${approver.lastName}` : "Pending";
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={leaveRequests}
      searchKey="employee"
      searchPlaceholder="Search by employee..."
    />
  );
}
