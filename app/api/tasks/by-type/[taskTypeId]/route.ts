import { ok } from "@/lib/api/response";
import { getDemoTasksByTaskTypeId } from "@/lib/demo/content";
import { serializeTask } from "@/lib/utils/serializers";
import { taskService } from "@/server/services/task.service";

type Params = {
  params: Promise<{ taskTypeId: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const { taskTypeId } = await params;

  try {
    const tasks = await taskService.listByType(taskTypeId);
    return ok(tasks.length > 0 ? tasks.map(serializeTask) : getDemoTasksByTaskTypeId(taskTypeId));
  } catch (error) {
    return ok(getDemoTasksByTaskTypeId(taskTypeId));
  }
}
