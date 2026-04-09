import { cookies } from "next/headers";

import { ok, fail } from "@/lib/api/response";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { serializeUser } from "@/lib/utils/serializers";
import { telegramIdAuthRequestSchema } from "@/schemas/auth";
import { authService } from "@/server/services/auth.service";

export async function POST(request: Request) {
  try {
    const body = telegramIdAuthRequestSchema.parse(await request.json());
    const user = await authService.authenticateTelegramId(body);
    const token = await createSessionToken({
      userId: user.id,
      telegramId: user.telegramId,
      role: user.role
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });

    return ok({
      user: serializeUser(user)
    });
  } catch (error) {
    return fail(error);
  }
}
