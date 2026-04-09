import { ok, fail } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth/server";
import { getDemoStatisticsDetail } from "@/lib/demo/statistics";
import { statisticsService } from "@/server/services/statistics.service";

type Params = {
  params: Promise<{ subjectId: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const { subjectId } = await params;

  try {
    const user = await getCurrentUser();
    const detail = await statisticsService.getSubjectStatistics(user.id, subjectId);
    return ok(detail);
  } catch (error) {
    const detail = getDemoStatisticsDetail(subjectId);
    return detail ? ok(detail) : fail(error);
  }
}
