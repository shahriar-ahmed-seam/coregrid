"use client";

import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";
import { ReactNode } from "react";

interface RoleGateProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

/**
 * Client-side role-based access control component
 * Conditionally renders children based on user's role
 */
export function RoleGate({ children, allowedRoles, fallback }: RoleGateProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null; // or a loading spinner
  }

  if (!session?.user) {
    return fallback || null;
  }

  const hasAccess = allowedRoles.includes(session.user.role);

  if (!hasAccess) {
    return fallback || null;
  }

  return <>{children}</>;
}

/**
 * Hook to check if user has specific role
 */
export function useHasRole(allowedRoles: UserRole[]): boolean {
  const { data: session } = useSession();
  
  if (!session?.user) {
    return false;
  }

  return allowedRoles.includes(session.user.role);
}

/**
 * Hook to check if user is admin
 */
export function useIsAdmin(): boolean {
  const { data: session } = useSession();
  return session?.user?.role === UserRole.ADMIN;
}
