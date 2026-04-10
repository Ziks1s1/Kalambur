import { ok, fail } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth/server";
import { serializeAttemptFile, serializeAiCheck, serializeTask, serializeVariant } from "@/lib/utils/serializers";
import { variantService } from "@/server/services/variant.service";

type Params = {
  params: Promise<{ variantId: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    const { variantId } = await params;
    const result = await variantService.getCurrentTask(user.id, variantId);
    return ok({
      variant: serializeVariant(result.variant),
      currentTask: result.currentTask
        ? {
            id: result.currentTask.id,
            orderIndex: result.currentTask.orderIndex,
            isCompleted: result.currentTask.isCompleted,
            taskBankItem: serializeTask(result.currentTask.taskBankItem),
            latestAttempt: result.currentTask.attempts?.[0]
              ? {
                  id: result.currentTask.attempts[0].id,
                  userId: result.currentTask.attempts[0].userId,
                  variantTaskId: result.currentTask.attempts[0].variantTaskId,
                  comment: result.currentTask.attempts[0].comment,
                  status: result.currentTask.attempts[0].status,
                  submittedAt: result.currentTask.attempts[0].submittedAt?.toISOString() ?? null,
                  checkedAt: result.currentTask.attempts[0].checkedAt?.toISOString() ?? null,
                  files: result.currentTask.attempts[0].files?.map(serializeAttemptFile) ?? [],
                  aiCheck: serializeAiCheck(result.currentTask.attempts[0].aiCheck ?? null)
                }
              : null
          }
        : null
    });
  } catch (error) {
    return fail(error);
  }
}
