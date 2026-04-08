import { ok, fail } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth/server";
import { serializeTask, serializeVariant } from "@/lib/utils/serializers";
import { switchTaskSchema } from "@/schemas/variant";
import { variantService } from "@/server/services/variant.service";

type Params = {
  params: Promise<{ variantId: string }>;
};

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    const { variantId } = await params;
    const body = switchTaskSchema.parse(await request.json());
    const result = await variantService.switchTask(user.id, variantId, body.variantTaskId);
    return ok({
      variant: serializeVariant(result.variant),
      currentTask: {
        id: result.currentTask.id,
        orderIndex: result.currentTask.orderIndex,
        isCompleted: result.currentTask.isCompleted,
        taskBankItem: serializeTask(result.currentTask.taskBankItem)
      }
    });
  } catch (error) {
    return fail(error);
  }
}
