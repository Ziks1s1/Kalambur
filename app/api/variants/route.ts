import { ok, fail } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth/server";
import { serializeVariant } from "@/lib/utils/serializers";
import { createVariantSchema } from "@/schemas/variant";
import { variantService } from "@/server/services/variant.service";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = createVariantSchema.parse(await request.json());
    const variant = await variantService.createVariant(user.id, body);
    return ok(serializeVariant(variant));
  } catch (error) {
    return fail(error);
  }
}
