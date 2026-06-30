"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import {
  LayoutDashboard,
  Users,
  Package,
  DollarSign,
  Briefcase,
  FolderKanban,
  Settings,
  Building2,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { UserNav } from "@/components/auth/user-nav";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: UserRole[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    allowedRoles: [
      UserRole.ADMIN,
      UserRole.HR,
      UserRole.SALES,
      UserRole.INVENTORY,
      UserRole.FINANCE,
      UserRole.PROJECT_MANAGER,
      UserRole.EMPLOYEE,
    ],
  },
  {
    title: "Human Resources",
    href: "/hr",
    icon: Users,
    allowedRoles: [UserRole.ADMIN, UserRole.HR],
  },
  {
    title: "CRM & Sales",
    href: "/crm",
    icon: Briefcase,
    allowedRoles: [UserRole.ADMIN, UserRole.SALES],
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: Package,
    allowedRoles: [UserRole.ADMIN, UserRole.INVENTORY],
  },
  {
    title: "Finance",
    href: "/finance",
    icon: DollarSign,
    allowedRoles: [UserRole.ADMIN, UserRole.FINANCE],
  },
  {
    title: "Projects",
    href: "/projects",
    icon: FolderKanban,
    allowedRoles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    allowedRoles: [UserRole.ADMIN],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const userRole =
    session?.user?.role ??
    (process.env.NEXT_PUBLIC_USE_MOCKS === "true" ? UserRole.ADMIN : undefined);

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter((item) =>
    userRole ? item.allowedRoles.includes(userRole) : false
  );

  const NavContent = () => (
    <>
      {/* Logo/Brand */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Building2 className="h-6 w-6 text-primary" />
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-lg">CoreGrid</span>
            <span className="text-xs text-muted-foreground">Enterprise ERP</span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle (Desktop only) */}
      <div className="hidden lg:block border-t p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full justify-start"
        >
          <ChevronLeft
            className={cn(
              "h-5 w-5 transition-transform",
              isCollapsed && "rotate-180"
            )}
          />
          {!isCollapsed && <span className="ml-2">Collapse</span>}
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <Building2 className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">CoreGrid</span>
        </div>
        <UserNav />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 z-50 h-full w-64 transform bg-background border-r transition-transform duration-200",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <NavContent />
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex fixed left-0 top-0 z-30 h-screen flex-col border-r bg-background transition-all duration-300",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <NavContent />
      </aside>
    </>
  );
}
