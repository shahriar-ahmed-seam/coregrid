"use client";

import { Attendance, Employee } from "@prisma/client";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type AttendanceWithRelations = Attendance & {
  employee: Employee;
};

interface AttendanceTableProps {
  attendance: AttendanceWithRelations[];
}

export function AttendanceTable({ attendance }: AttendanceTableProps) {
  const columns: Column<AttendanceWithRelations>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: (row) => new Date(row.date).toLocaleDateString(),
    },
    {
      accessorKey: "employee",
      header: "Employee",
      cell: (row) => {
        const emp = row.employee;
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
      accessorKey: "status",
      header: "Status",
      cell: (row) => {
        const status = row.status;
        const colors = {
          PRESENT: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          ABSENT: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
          LATE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
          HALF_DAY: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
          ON_LEAVE: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
        };
        return (
          <Badge variant="secondary" className={colors[status]}>
            {status.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "checkIn",
      header: "Check In",
      cell: (row) => {
        const time = row.checkIn;
        return time ? format(new Date(time), "HH:mm") : "N/A";
      },
    },
    {
      accessorKey: "checkOut",
      header: "Check Out",
      cell: (row) => {
        const time = row.checkOut;
        return time ? format(new Date(time), "HH:mm") : "N/A";
      },
    },
    {
      header: "Hours",
      cell: (row) => {
        const checkIn = row.checkIn;
        const checkOut = row.checkOut;
        if (!checkIn || !checkOut) return "N/A";
        
        const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
        const hours = (diff / (1000 * 60 * 60)).toFixed(1);
        return `${hours}h`;
      },
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: (row) => (
        <div className="max-w-[200px] truncate">
          {row.notes || "N/A"}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={attendance}
    />
  );
}
