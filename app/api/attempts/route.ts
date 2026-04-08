import { ok, fail } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth/server";
import { attemptSchema, createAttemptSchema } from "@/schemas/attempt";
import { serializeAiCheck, serializeAttemptFile } from "@/lib/utils/serializers";
import { attemptService } from "@/server/services/attempt.service";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = createAttemptSchema.parse(await request.json());
    const attempt = await attemptService.createAttempt(user.id, body.variantTaskId, body.comment);

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
