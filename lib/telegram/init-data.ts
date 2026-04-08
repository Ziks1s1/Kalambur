import crypto from "node:crypto";

import { z } from "zod";

import { env } from "@/lib/env";
import { AppError } from "@/lib/errors/app-error";

const telegramUserSchema = z.object({
  id: z.number().int(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional()
});

const parsedInitDataSchema = z.object({
  auth_date: z.string(),
  query_id: z.string().optional(),
  user: telegramUserSchema,
  hash: z.string()
});

export type TelegramUserPayload = z.infer<typeof telegramUserSchema>;

function buildDataCheckString(params: URLSearchParams) {
  return Array.from(params.entries())
    .filter(([key]) => key !== "hash")
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
}

export function verifyTelegramInitData(initData: string) {
  const params = new URLSearchParams(initData);
  const raw = Object.fromEntries(params.entries());
  let parsedUser: unknown;

  try {
    parsedUser = raw.user ? JSON.parse(raw.user) : undefined;
  } catch {
    throw new AppError("Invalid Telegram init data payload", 401, "TELEGRAM_AUTH_INVALID");
  }

  const parsed = parsedInitDataSchema.safeParse({
    ...raw,
    user: parsedUser
  });

  if (!parsed.success) {
    throw new AppError("Invalid Telegram init data payload", 401, "TELEGRAM_AUTH_INVALID");
  }

  const dataCheckString = buildDataCheckString(params);
  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(env.TELEGRAM_BOT_TOKEN)
    .digest();

  const expectedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  if (expectedHash !== parsed.data.hash) {
    throw new AppError("Telegram init data hash mismatch", 401, "TELEGRAM_AUTH_INVALID");
  }

  const authDate = Number(parsed.data.auth_date);
  const now = Math.floor(Date.now() / 1000);

  if (!Number.isFinite(authDate) || now - authDate > 60 * 60 * 12) {
    throw new AppError("Telegram init data expired", 401, "TELEGRAM_AUTH_EXPIRED");
  }

  return parsed.data.user;
}
