import { ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/server";
import { createTaskTypeSchema } from "@/schemas/admin";
import { adminService } from "@/server/services/admin.service";

export async function GET() {
  try {
    await requireAdmin();
    return ok(await adminService.listTaskTypes());
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = createTaskTypeSchema.parse(await request.json());
    return ok(await adminService.createTaskType(body));
  } catch (error) {
    return fail(error);
  }
}
