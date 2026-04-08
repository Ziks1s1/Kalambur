import { ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/server";
import { adminService } from "@/server/services/admin.service";

export async function GET() {
  try {
    await requireAdmin();
    return ok(await adminService.listAttempts());
  } catch (error) {
    return fail(error);
  }
}
