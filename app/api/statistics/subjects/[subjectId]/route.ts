import { ok, fail } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth/server";
import { statisticsService } from "@/server/services/statistics.service";

type Params = {
  params: Promise<{ subjectId: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    const { subjectId } = await params;
    const detail = await statisticsService.getSubjectStatistics(user.id, subjectId);
    return ok(detail);
  } catch (error) {
    return fail(error);
  }
}
