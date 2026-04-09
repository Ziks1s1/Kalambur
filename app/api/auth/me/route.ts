import { ok, fail } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth/server";
import { serializeUser } from "@/lib/utils/serializers";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return ok({
      user: serializeUser(user)
    });
  } catch (error) {
    return fail(error);
  }
}
