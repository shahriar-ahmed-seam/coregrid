import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { IS_DEMO } from "@/lib/demo/demo-mode";
import { createDemoPrisma } from "@/lib/demo/engine";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // Standalone demo mode: no database required. All queries are served by an
  // in-memory, Prisma-compatible engine so the whole app stays explorable.
  if (IS_DEMO) {
    return createDemoPrisma() as PrismaClient;
  }

  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { Prisma };
export default prisma;
