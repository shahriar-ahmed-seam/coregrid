"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { DEMO_USER } from "@/lib/demo/demo-mode";

const roleLabels: Record<string, string> = {
  ADMIN: "Administrator",
  HR: "HR Manager",
  SALES: "Sales Rep",
  INVENTORY: "Inventory Manager",
  FINANCE: "Finance Manager",
  PROJECT_MANAGER: "Project Manager",
  EMPLOYEE: "Employee",
};

const roleColors: Record<string, string> = {
  ADMIN: "bg-red-500",
  HR: "bg-blue-500",
  SALES: "bg-green-500",
  INVENTORY: "bg-purple-500",
  FINANCE: "bg-yellow-500",
  PROJECT_MANAGER: "bg-indigo-500",
  EMPLOYEE: "bg-gray-500",
};

export function UserNav() {
  const { data: session } = useSession();
  const isDemo = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

  const user = session?.user ?? (isDemo ? DEMO_USER : null);

  if (!user) {
    return null;
  }

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || user.email![0].toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.image || ""} alt={user.name || ""} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <Badge
              variant="secondary"
              className={`w-fit text-xs ${roleColors[user.role]} text-white`}
            >
              {roleLabels[user.role]}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={() =>
            isDemo
              ? (window.location.href = "/")
              : signOut({ callbackUrl: "/auth/login" })
          }
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isDemo ? "Exit demo" : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
