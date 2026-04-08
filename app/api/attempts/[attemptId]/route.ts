import { ok, fail } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth/server";
import { attemptSchema } from "@/schemas/attempt";
import { serializeAiCheck, serializeAttemptFile } from "@/lib/utils/serializers";
import { attemptService } from "@/server/services/attempt.service";

type Params = {
  params: Promise<{ attemptId: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    const { attemptId } = await params;
    const attempt = await attemptService.getAttempt(user.id, attemptId);

    return ok(
      attemptSchema.parse({
        id: attempt.id,
        userId: attempt.userId,
        variantTaskId: attempt.variantTaskId,
        comment: attempt.comment,
        status: attempt.status,
        submittedAt: attempt.submittedAt?.toISOString() ?? null,
        checkedAt: attempt.checkedAt?.toISOString() ?? null,
        files: attempt.files.map(serializeAttemptFile),
        aiCheck: serializeAiCheck(attempt.aiCheck)
      })
    );
  } catch (error) {
    return fail(error);
  }
}
