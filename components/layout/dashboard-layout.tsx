"use client";

import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { UserNav } from "@/components/auth/user-nav";
import { NotificationDropdown } from "./notification-dropdown";
import { Footer } from "./footer";
import { Sparkles } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const isDemo = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

  return (
    <div className="relative min-h-screen">
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Top Header (Desktop) */}
        <header className="hidden lg:flex sticky top-0 z-20 h-16 items-center justify-between border-b bg-background px-6">
          <div className="flex-1">
            {isDemo && (
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Live demo · sample data · changes aren&apos;t saved
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <NotificationDropdown />
            <UserNav />
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6 pt-20 lg:pt-6 min-h-[calc(100vh-4rem)]">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
