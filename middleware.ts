import { withAuth } from "next-auth/middleware";
import { NextResponse, type NextRequest } from "next/server";

const IS_DEMO =
  process.env.NEXT_PUBLIC_USE_MOCKS === "true" || !process.env.DATABASE_URL;

// Role names mirror the Prisma `UserRole` enum. We intentionally use string
// literals here (not the Prisma enum) so the heavy `@prisma/client` runtime is
// never pulled into the Edge middleware bundle.
type Role =
  | "ADMIN"
  | "HR"
  | "SALES"
  | "INVENTORY"
  | "FINANCE"
  | "PROJECT_MANAGER"
  | "EMPLOYEE";

const ALL_ROLES: Role[] = [
  "ADMIN",
  "HR",
  "SALES",
  "INVENTORY",
  "FINANCE",
  "PROJECT_MANAGER",
  "EMPLOYEE",
];

// Protected route prefixes and the roles allowed to access them.
const roleBasedRoutes: Record<string, Role[]> = {
  "/dashboard": ALL_ROLES,
  "/hr": ["ADMIN", "HR"],
  "/crm": ["ADMIN", "SALES"],
  "/inventory": ["ADMIN", "INVENTORY"],
  "/finance": ["ADMIN", "FINANCE"],
  "/projects": ["ADMIN", "PROJECT_MANAGER"],
  "/settings": ["ADMIN"],
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

        if (path === "/") return NextResponse.next();

        for (const [route, allowedRoles] of Object.entries(roleBasedRoutes)) {
          if (path.startsWith(route)) {
            const userRole = token?.role as Role | undefined;
            if (!userRole || !allowedRoles.includes(userRole)) {
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
