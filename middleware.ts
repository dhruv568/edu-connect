import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookie = request.cookies.get("educonnect_session");

  // Public paths accessible without authentication
  const isPublicPath =
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/verify-email") ||
    pathname.startsWith("/find-teachers") ||
    pathname.startsWith("/courses") ||
    pathname.startsWith("/pricing") ||
    pathname.startsWith("/how-it-works") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/refund") ||
    pathname === "/admin/login" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon");

  if (!cookie && !isPublicPath) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Parse basic session payload from cookie if present
  let userSession: { role?: string; emailVerified?: boolean } | null = null;
  if (cookie?.value) {
    try {
      const jsonStr = Buffer.from(cookie.value, "base64url").toString("utf-8");
      userSession = JSON.parse(jsonStr);
    } catch {
      userSession = null;
    }
  }

  // Role route guards
  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && userSession?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (pathname.startsWith("/teacher") && userSession?.role !== "TEACHER") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/student") && userSession?.role !== "STUDENT") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/parent")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
