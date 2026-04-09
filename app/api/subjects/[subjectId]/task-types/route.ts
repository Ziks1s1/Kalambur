import { ok } from "@/lib/api/response";
import { getDemoTaskTypesBySubjectId } from "@/lib/demo/content";
import { serializeTaskType } from "@/lib/utils/serializers";
import { subjectService } from "@/server/services/subject.service";

type Params = {
  params: Promise<{ subjectId: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const { subjectId } = await params;

  try {
    const taskTypes = await subjectService.getTaskTypes(subjectId);
    return ok(taskTypes.length > 0 ? taskTypes.map(serializeTaskType) : getDemoTaskTypesBySubjectId(subjectId));
  } catch (error) {
    return ok(getDemoTaskTypesBySubjectId(subjectId));
  }
}
