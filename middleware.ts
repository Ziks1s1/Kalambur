import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

const PUBLIC_PATHS = ["/", "/api/auth/telegram"];
const PROTECTED_PREFIXES = ["/variants", "/statistics", "/api/variants", "/api/attempts", "/api/statistics"];
const ADMIN_PREFIXES = ["/admin", "/api/admin"];

async function verifyToken(token: string) {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    return null;
  }

  try {
    const verified = await jwtVerify(token, new TextEncoder().encode(secret));
    return verified.payload as { role?: string };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/_next") || pathname.startsWith("/uploads")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const needsAuth = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const needsAdmin = ADMIN_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!needsAuth && !needsAdmin) {
    return NextResponse.next();
  }

  if (!token) {
    return needsAdmin || pathname.startsWith("/api/")
      ? NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 })
      : NextResponse.redirect(new URL("/", request.url));
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return needsAdmin || pathname.startsWith("/api/")
      ? NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Invalid session" } }, { status: 401 })
      : NextResponse.redirect(new URL("/", request.url));
  }

  if (needsAdmin && payload.role !== "ADMIN") {
    return pathname.startsWith("/api/")
      ? NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Admin access required" } }, { status: 403 })
      : NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!favicon.ico).*)"]
};
