import { cookies } from "next/headers";

import { db } from "@/lib/db";
import { AppError } from "@/lib/errors/app-error";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

export async function getRequiredSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    throw new AppError("Authentication required", 401, "UNAUTHORIZED");
  }

  return verifySessionToken(token);
}

export async function getCurrentUser() {
  const session = await getRequiredSession();
  const user = await db.user.findUnique({ where: { id: session.userId } });

  if (!user) {
    throw new AppError("User not found", 401, "UNAUTHORIZED");
  }

  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (user.role !== "ADMIN") {
    throw new AppError("Admin access required", 403, "FORBIDDEN");
  }

  return user;
}
