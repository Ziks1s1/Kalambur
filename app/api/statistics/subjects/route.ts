import { ok } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth/server";
import { getDemoStatisticsSummary } from "@/lib/demo/statistics";
import { statisticsService } from "@/server/services/statistics.service";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const summary = await statisticsService.getSubjectsSummary(user.id);
    return ok(summary);
  } catch (error) {
    return ok(getDemoStatisticsSummary());
  }
}
