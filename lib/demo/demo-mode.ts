/**
 * Demo / Standalone mode
 * --------------------------------------------------------------------------
 * CoreGrid normally runs against PostgreSQL + NextAuth + a local Ollama LLM.
 * For public demos (e.g. Vercel) none of that infrastructure is available, so
 * we switch the application into a fully self-contained "demo mode" that is
 * powered by an in-memory dataset and a Prisma-compatible query engine.
 *
 * Demo mode is enabled when:
 *   - NEXT_PUBLIC_USE_MOCKS === "true"  (explicit opt-in, default for Vercel), OR
 *   - there is no DATABASE_URL configured (no database to talk to).
 *
 * The flag is evaluated from public env so it is consistent on both the server
 * and the edge middleware.
 */
export const IS_DEMO =
  process.env.NEXT_PUBLIC_USE_MOCKS === "true" || !process.env.DATABASE_URL;

/** A stable demo identity used when authentication is bypassed. */
export const DEMO_USER = {
  id: "demo-admin",
  name: "Avery Quinn",
  email: "admin@coregrid.com",
  role: "ADMIN" as const,
  image: null as string | null,
};

/** Shape compatible with `getServerSession` output. */
export const DEMO_SESSION = {
  user: DEMO_USER,
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
};
