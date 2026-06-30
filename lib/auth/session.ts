import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { IS_DEMO, DEMO_SESSION, DEMO_USER } from "@/lib/demo/demo-mode";

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: UserRole;
  image?: string | null;
};

/**
 * Get the current session on the server side
 */
export async function getCurrentSession() {
  if (IS_DEMO) return DEMO_SESSION as unknown as Awaited<ReturnType<typeof getServerSession>>;
  return await getServerSession(authOptions);
}

/**
 * Get the current user or throw error if not authenticated
 */
export async function getCurrentUser(): Promise<SessionUser> {
  if (IS_DEMO) return DEMO_USER as unknown as SessionUser;

  const session = await getCurrentSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return session.user as SessionUser;
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export async function requireAuth(): Promise<SessionUser> {
  if (IS_DEMO) return DEMO_USER as unknown as SessionUser;

  const session = await getCurrentSession();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return session.user as SessionUser;
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: UserRole, allowedRoles: readonly UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Require specific role - redirect to unauthorized if user doesn't have permission
 */
export async function requireRole(allowedRoles: readonly UserRole[]) {
  const user = await requireAuth();

  if (!hasRole(user.role, allowedRoles)) {
    redirect("/unauthorized");
  }

  return user;
}

/**
 * Check if user is admin
 */
export async function isAdmin() {
  const user = await getCurrentUser();
  return user.role === UserRole.ADMIN;
}

/**
 * Require admin role
 */
export async function requireAdmin() {
  return await requireRole([UserRole.ADMIN]);
}

/**
 * Role-based access control helpers
 */
export const RBAC = {
  // Admin has access to everything
  ADMIN: [UserRole.ADMIN],
  
  // HR Module access
  HR: [UserRole.ADMIN, UserRole.HR],
  
  // Sales/CRM Module access
  SALES: [UserRole.ADMIN, UserRole.SALES],
  
  // Inventory Module access
  INVENTORY: [UserRole.ADMIN, UserRole.INVENTORY],
  
  // Finance Module access
  FINANCE: [UserRole.ADMIN, UserRole.FINANCE],
  
  // Project Management access
  PROJECT_MANAGEMENT: [UserRole.ADMIN, UserRole.PROJECT_MANAGER],
  
  // Basic employee access (all authenticated users)
  EMPLOYEE: [
    UserRole.ADMIN,
    UserRole.HR,
    UserRole.SALES,
    UserRole.INVENTORY,
    UserRole.FINANCE,
    UserRole.PROJECT_MANAGER,
    UserRole.EMPLOYEE,
  ],
} as const;
