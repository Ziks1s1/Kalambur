import { UserRole } from "@prisma/client";

import { db } from "@/lib/db";
import { adminTelegramIds } from "@/lib/env";
import { verifyTelegramInitData } from "@/lib/telegram/init-data";

export class AuthService {
  async authenticateTelegram(initData: string) {
    const telegramUser = verifyTelegramInitData(initData);
    const role: UserRole = adminTelegramIds.includes(String(telegramUser.id)) ? "ADMIN" : "STUDENT";

    return db.user.upsert({
      where: {
        telegramId: String(telegramUser.id)
      },
      update: {
        username: telegramUser.username ?? null,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name ?? null,
        role
      },
      create: {
        telegramId: String(telegramUser.id),
        username: telegramUser.username ?? null,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name ?? null,
        role
      }
    });
  }
}

export const authService = new AuthService();
