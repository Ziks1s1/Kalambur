import { UserRole } from "@prisma/client";

import { db } from "@/lib/db";
import { getAdminTelegramIds } from "@/lib/env";
import type { TelegramIdAuthRequest } from "@/schemas/auth";

export class AuthService {
  private async resolveRole(telegramId: string): Promise<UserRole> {
    if (getAdminTelegramIds().includes(telegramId)) {
      return "ADMIN";
    }

    const existingUser = await db.user.findUnique({
      where: { telegramId },
      select: { role: true }
    });

    return existingUser?.role ?? "STUDENT";
  }

  async authenticateTelegram(initData: string) {
    const { verifyTelegramInitData } = await import("@/lib/telegram/init-data");
    const telegramUser = verifyTelegramInitData(initData);
    const role = await this.resolveRole(String(telegramUser.id));

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

  async authenticateTelegramId(input: TelegramIdAuthRequest) {
    const role = await this.resolveRole(input.telegramId);

    return db.user.upsert({
      where: {
        telegramId: input.telegramId
      },
      update: {
        username: input.username ?? null,
        firstName: input.firstName,
        lastName: input.lastName ?? null,
        role
      },
      create: {
        telegramId: input.telegramId,
        username: input.username ?? null,
        firstName: input.firstName,
        lastName: input.lastName ?? null,
        role
      }
    });
  }
}

export const authService = new AuthService();
