import { SignJWT, jwtVerify } from "jose";

import { AppError } from "@/lib/errors/app-error";

export const SESSION_COOKIE_NAME = "egebot_session";

function getSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new AppError("SESSION_SECRET is not configured", 500, "SESSION_SECRET_INVALID");
  }

  return new TextEncoder().encode(secret);
}

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
    .sign(getSecret());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as SessionPayload;
  } catch {
    throw new AppError("Invalid session", 401, "UNAUTHORIZED");
  }
}
