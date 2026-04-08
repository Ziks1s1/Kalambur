import { ok, fail } from "@/lib/api/response";
import { db } from "@/lib/db";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;

    return ok({
      status: "ok",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return fail(error);
  }
}
