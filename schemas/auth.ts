import { z } from "zod";

export const telegramAuthRequestSchema = z.object({
  initData: z.string().min(1)
});

export const telegramIdAuthRequestSchema = z.object({
  telegramId: z.string().min(1),
  username: z.string().nullable().optional(),
  firstName: z.string().min(1),
  lastName: z.string().nullable().optional()
});

export const userResponseSchema = z.object({
  id: z.string(),
  telegramId: z.string(),
  username: z.string().nullable(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  role: z.enum(["STUDENT", "ADMIN"])
});

export const telegramAuthResponseSchema = z.object({
  user: userResponseSchema
});

export type TelegramAuthRequest = z.infer<typeof telegramAuthRequestSchema>;
export type TelegramIdAuthRequest = z.infer<typeof telegramIdAuthRequestSchema>;
export type TelegramAuthResponse = z.infer<typeof telegramAuthResponseSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
