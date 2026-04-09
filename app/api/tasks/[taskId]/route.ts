import { ok, fail } from "@/lib/api/response";
import { serializeTask } from "@/lib/utils/serializers";
import { taskService } from "@/server/services/task.service";

type Params = {
  params: Promise<{ taskId: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const { taskId } = await params;
    const task = await taskService.getTask(taskId);
    return ok(serializeTask(task));
  } catch (error) {
    return fail(error);
  }
}
