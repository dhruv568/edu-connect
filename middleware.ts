import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets & internal Next.js paths
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Public paths accessible without authentication and accessible to unverified/verified users
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
    pathname.startsWith("/api/");

  const cookie = request.cookies.get("educonnect_session");

  // If no session cookie present
  if (!cookie?.value) {
    if (isPublicPath) {
      return NextResponse.next();
    }
    // Unauthenticated user attempting to access protected route
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Parse session payload from cookie
  let userSession: { email?: string; role?: string; emailVerified?: boolean } | null = null;
  try {
    const jsonStr = Buffer.from(cookie.value, "base64url").toString("utf-8");
    userSession = JSON.parse(jsonStr);
  } catch {
    userSession = null;
  }

  if (!userSession) {
    if (isPublicPath) {
      return NextResponse.next();
    }
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Unverified user handling
  if (!userSession.emailVerified) {
    // Unverified users CAN access public routes (like /, /courses, /verify-email, etc.)
    if (isPublicPath) {
      return NextResponse.next();
    }
    // Unverified users attempting to access protected routes must be redirected to /verify-email
    const verifyUrl = new URL("/verify-email", request.url);
    if (userSession.email) {
      verifyUrl.searchParams.set("email", userSession.email);
    }
    verifyUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(verifyUrl);
  }

  // Verified user role-protected route guards
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (userSession.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  if (pathname.startsWith("/teacher")) {
    if (userSession.role !== "TEACHER") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (pathname.startsWith("/student")) {
    if (userSession.role !== "STUDENT") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (pathname.startsWith("/parent")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
