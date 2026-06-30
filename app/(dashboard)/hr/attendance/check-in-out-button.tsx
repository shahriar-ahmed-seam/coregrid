"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock } from "lucide-react";

export function CheckInOutButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [action, setAction] = useState<"checkin" | "checkout">("checkin");
  const [employeeId, setEmployeeId] = useState("");
  const [employees, setEmployees] = useState<Array<{ id: string; firstName: string; lastName: string }>>([]);

  const handleOpen = async () => {
    setIsOpen(true);
    // Fetch employees
    try {
      const response = await fetch("/api/hr/employees?limit=1000");
      if (response.ok) {
        const data = await response.json();
        // API returns { employees: [], pagination: {} }
        const employeeList = data.employees || [];
        setEmployees(employeeList.filter((e: any) => e.status === "ACTIVE"));
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    }
  };

  const handleSubmit = async () => {
    if (!employeeId) {
      alert("Please select an employee");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/hr/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          action,
        }),
      });

      if (response.ok) {
        setIsOpen(false);
        setEmployeeId("");
        router.refresh();
      } else {
        const errorData = await response.json();
        alert(`Failed: ${errorData.details || errorData.error}`);
      }
    } catch (error) {
      console.error("Failed to record attendance:", error);
      alert("Failed to record attendance. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button onClick={handleOpen}>
        <Clock className="h-4 w-4 mr-2" />
        Check In/Out
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Attendance</DialogTitle>
            <DialogDescription>
              Check in or check out an employee for today
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="action">Action</Label>
              <Select value={action} onValueChange={(v) => setAction(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checkin">Check In</SelectItem>
                  <SelectItem value="checkout">Check Out</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="employee">Employee</Label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Recording..." : "Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
