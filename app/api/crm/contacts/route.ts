import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({
      include: {
        customer: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const contact = await prisma.contact.create({
      data: body,
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    );
  }
}
