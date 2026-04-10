import { z } from "zod";

import { ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/server";
import { serializeUser } from "@/lib/utils/serializers";
import { adminService } from "@/server/services/admin.service";

const addAdminSchema = z.object({
  telegramId: z.string().min(1)
});

export async function GET() {
  try {
    await requireAdmin();
    const admins = await adminService.listAdmins();
    return ok(admins.map(serializeUser));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = addAdminSchema.parse(await request.json());
    const admin = await adminService.addAdminByTelegramId(body.telegramId);
    return ok(serializeUser(admin));
  } catch (error) {
    return fail(error);
  }
}
