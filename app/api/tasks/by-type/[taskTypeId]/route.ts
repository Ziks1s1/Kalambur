import { ok, fail } from "@/lib/api/response";
import { serializeTask } from "@/lib/utils/serializers";
import { taskService } from "@/server/services/task.service";

type Params = {
  params: Promise<{ taskTypeId: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const { taskTypeId } = await params;
    const tasks = await taskService.listByType(taskTypeId);
    return ok(tasks.map(serializeTask));
  } catch (error) {
    return fail(error);
  }
}
