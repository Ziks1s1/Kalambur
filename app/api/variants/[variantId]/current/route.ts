import { ok, fail } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth/server";
import { serializeTask, serializeVariant } from "@/lib/utils/serializers";
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
            taskBankItem: serializeTask(result.currentTask.taskBankItem)
          }
        : null
    });
  } catch (error) {
    return fail(error);
  }
}
