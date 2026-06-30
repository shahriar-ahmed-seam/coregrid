import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, action } = body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if attendance record exists for today
    let attendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: today,
      },
    });

    if (action === "checkin") {
      if (attendance) {
        return NextResponse.json(
          { error: "Already checked in today" },
          { status: 400 }
        );
      }

      attendance = await prisma.attendance.create({
        data: {
          employeeId,
          date: today,
          checkIn: new Date(),
          status: "PRESENT",
        },
      });
    } else if (action === "checkout") {
      if (!attendance) {
        return NextResponse.json(
          { error: "No check-in record found for today" },
          { status: 400 }
        );
      }

      if (attendance.checkOut) {
        return NextResponse.json(
          { error: "Already checked out today" },
          { status: 400 }
        );
      }

      attendance = await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          checkOut: new Date(),
        },
      });
    }

    return NextResponse.json(attendance, { status: 201 });
  } catch (error) {
    console.error("Failed to record attendance:", error);
    return NextResponse.json(
      { 
        error: "Failed to record attendance",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
