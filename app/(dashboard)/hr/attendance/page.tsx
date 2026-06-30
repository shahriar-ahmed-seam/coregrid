import { PageHeader } from "@/components/layout/page-header";
import { AttendanceTable } from "./attendance-table";
import { CheckInOutButton } from "./check-in-out-button";
import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

export default async function AttendancePage() {
  const now = new Date();
  const startDate = startOfMonth(now);
  const endDate = endOfMonth(now);

  const attendance = await prisma.attendance.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      employee: true,
    },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          title="Attendance"
          description="Track employee attendance records"
          backHref="/hr"
        />
        <CheckInOutButton />
      </div>

      <AttendanceTable attendance={attendance} />
    </div>
  );
}
