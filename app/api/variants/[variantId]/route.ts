import { ok, fail } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth/server";
import { serializeVariant } from "@/lib/utils/serializers";
import { variantService } from "@/server/services/variant.service";

type Params = {
  params: Promise<{ variantId: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    const { variantId } = await params;
    const variant = await variantService.getVariantForUser(user.id, variantId);
    return ok(serializeVariant(variant));
  } catch (error) {
    return fail(error);
  }
}
