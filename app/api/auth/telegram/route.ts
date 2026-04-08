import { cookies } from "next/headers";

import { ok, fail } from "@/lib/api/response";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { telegramAuthRequestSchema } from "@/schemas/auth";
import { serializeUser } from "@/lib/utils/serializers";
import { authService } from "@/server/services/auth.service";

export async function POST(request: Request) {
  try {
    const body = telegramAuthRequestSchema.parse(await request.json());
    const user = await authService.authenticateTelegram(body.initData);
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
