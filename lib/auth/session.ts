import { SignJWT, jwtVerify } from "jose";

import { env } from "@/lib/env";
import { AppError } from "@/lib/errors/app-error";

export const SESSION_COOKIE_NAME = "egebot_session";

const secret = new TextEncoder().encode(env.SESSION_SECRET);

export type SessionPayload = {
  userId: string;
  telegramId: string;
  role: "STUDENT" | "ADMIN";
};

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as SessionPayload;
  } catch {
    throw new AppError("Invalid session", 401, "UNAUTHORIZED");
  }
}
