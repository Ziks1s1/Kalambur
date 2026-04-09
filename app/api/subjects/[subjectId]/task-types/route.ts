import { ok, fail } from "@/lib/api/response";
import { serializeTaskType } from "@/lib/utils/serializers";
import { subjectService } from "@/server/services/subject.service";

type Params = {
  params: Promise<{ subjectId: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const { subjectId } = await params;
    const taskTypes = await subjectService.getTaskTypes(subjectId);
    return ok(taskTypes.map(serializeTaskType));
  } catch (error) {
    return fail(error);
  }
}
