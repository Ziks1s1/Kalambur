import { ok, fail } from "@/lib/api/response";
import { getDemoTaskById } from "@/lib/demo/content";
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
    const { taskId } = await params;
    const demoTask = getDemoTaskById(taskId);

    if (demoTask) {
      return ok(demoTask);
    }

    return fail(error);
  }
}
