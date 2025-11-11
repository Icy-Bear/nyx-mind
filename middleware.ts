import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const sessionCookie = getSessionCookie(req);

  const isLoggedIn = !!sessionCookie;
  const isOnProtectedRoute = nextUrl.pathname.startsWith("/dashboard");
  const isOnAuthRoute = nextUrl.pathname.startsWith("/auth");
  const isOnPublicRoute =
    nextUrl.pathname.startsWith("/goodbye") ||
    nextUrl.pathname.startsWith("/auth");

  if (isOnPublicRoute) return NextResponse.next();

  if (isOnProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (isOnAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
