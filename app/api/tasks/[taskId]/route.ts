import { ok, fail } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth/server";
import { serializeTask } from "@/lib/utils/serializers";
import { taskService } from "@/server/services/task.service";

type Params = {
  params: Promise<{ taskId: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    await getCurrentUser();
    const { taskId } = await params;
    const task = await taskService.getTask(taskId);
    return ok(serializeTask(task));
  } catch (error) {
    return fail(error);
  }
}
