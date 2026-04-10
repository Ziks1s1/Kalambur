import { ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/server";
import { serializeUser } from "@/lib/utils/serializers";
import { adminService } from "@/server/services/admin.service";

type Params = {
  params: Promise<{ userId: string }>;
};

export async function DELETE(_: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { userId } = await params;
    const user = await adminService.revokeAdmin(userId);
    return ok(serializeUser(user));
  } catch (error) {
    return fail(error);
  }
}
