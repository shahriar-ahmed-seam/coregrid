import { withAuth } from "next-auth/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { UserRole } from "@prisma/client";

const IS_DEMO = process.env.NEXT_PUBLIC_USE_MOCKS === "true" || !process.env.DATABASE_URL;

// Define protected routes and their required roles
const roleBasedRoutes: Record<string, UserRole[]> = {
  "/dashboard": [
    UserRole.ADMIN,
    UserRole.HR,
    UserRole.SALES,
    UserRole.INVENTORY,
    UserRole.FINANCE,
    UserRole.PROJECT_MANAGER,
    UserRole.EMPLOYEE,
  ],
  "/hr": [UserRole.ADMIN, UserRole.HR],
  "/crm": [UserRole.ADMIN, UserRole.SALES],
  "/inventory": [UserRole.ADMIN, UserRole.INVENTORY],
  "/finance": [UserRole.ADMIN, UserRole.FINANCE],
  "/projects": [UserRole.ADMIN, UserRole.PROJECT_MANAGER],
  "/settings": [UserRole.ADMIN],
};

export default IS_DEMO
  ? function middleware(_req: NextRequest) {
      // Standalone demo mode: authentication is bypassed, allow all routes.
      return NextResponse.next();
    }
  : withAuth(
      function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Allow access to root path
        if (path === "/") {
          return NextResponse.next();
        }

        // Check role-based access
        for (const [route, allowedRoles] of Object.entries(roleBasedRoutes)) {
          if (path.startsWith(route)) {
            const userRole = token?.role as UserRole;

            if (!allowedRoles.includes(userRole)) {
              return NextResponse.redirect(new URL("/unauthorized", req.url));
            }
          }
        }

        return NextResponse.next();
      },
      {
        callbacks: {
          authorized: ({ token }) => !!token,
        },
        pages: {
          signIn: "/auth/login",
        },
      }
    );

// Specify which routes should be protected
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/hr/:path*",
    "/crm/:path*",
    "/inventory/:path*",
    "/finance/:path*",
    "/projects/:path*",
    "/settings/:path*",
  ],
};
