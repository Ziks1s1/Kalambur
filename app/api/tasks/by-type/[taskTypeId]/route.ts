import { ok, fail } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth/server";
import { serializeTask } from "@/lib/utils/serializers";
import { taskService } from "@/server/services/task.service";

type Params = {
  params: Promise<{ taskTypeId: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    await getCurrentUser();
    const { taskTypeId } = await params;
    const tasks = await taskService.listByType(taskTypeId);
    return ok(tasks.map(serializeTask));
  } catch (error) {
    return fail(error);
  }
}
