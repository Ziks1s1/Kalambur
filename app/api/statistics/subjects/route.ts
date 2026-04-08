import { ok, fail } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth/server";
import { statisticsService } from "@/server/services/statistics.service";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const summary = await statisticsService.getSubjectsSummary(user.id);
    return ok(summary);
  } catch (error) {
    return fail(error);
  }
}
