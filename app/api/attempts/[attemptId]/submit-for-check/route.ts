import { ok, fail } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth/server";
import { serializeAiCheck } from "@/lib/utils/serializers";
import { attemptService } from "@/server/services/attempt.service";
import { aiCheckService } from "@/server/services/ai-check.service";

type Params = {
  params: Promise<{ attemptId: string }>;
};

export async function POST(_: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    const { attemptId } = await params;
    await attemptService.markSubmitted(attemptId, user.id);
    const aiCheck = await aiCheckService.runAttemptCheck(attemptId, user.id);
    return ok(serializeAiCheck(aiCheck));
  } catch (error) {
    return fail(error);
  }
}
