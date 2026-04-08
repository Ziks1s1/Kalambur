import { ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/server";
import { createTaskSchema } from "@/schemas/admin";
import { adminService } from "@/server/services/admin.service";

type Params = {
  params: Promise<{ taskId: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { taskId } = await params;
    const body = createTaskSchema.parse(await request.json());
    return ok(await adminService.updateTask(taskId, body));
  } catch (error) {
    return fail(error);
  }
}
