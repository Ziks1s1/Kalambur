import { ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/server";
import { mathProfileImportService } from "@/server/services/math-profile-import.service";

export async function POST() {
  try {
    await requireAdmin();
    await mathProfileImportService.ensureImported();
    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}
