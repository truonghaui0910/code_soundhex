import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Skip middleware for public routes and static files
  const publicPaths = [
    "/",
    "/login",
    "/register",
    "/api",
    "/_next",
    "/favicon.ico",
  ];
  const isPublicPath = publicPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path),
  );

  if (isPublicPath) {
    return res;
  }

  // Try to get session and refresh if needed
  let {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  // If no session, try to refresh
  if (!session) {
    const { data: refreshData, error: refreshError } =
      await supabase.auth.refreshSession();
    session = refreshData.session;
    if (refreshError) {
      console.log("Session refresh error:", refreshError.message);
    }
  }

  console.log(
    "Middleware executing for:",
    req.nextUrl.pathname,
    "Session exists:",
    !!session,
    "Error:",
    error?.message || "no error",
  );

  // Protected routes - all routes that should require authentication
  const protectedPaths = [
    "/dashboard",
    "/license",
    "/agreements",
    "/album",
    "/music",
    "/right-management",
  ];
  const isProtectedPath = protectedPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path),
  );
  // Redirect to login if accessing protected route without session
  if (isProtectedPath && !session) {
    console.log(
      "🔒 REDIRECTING TO LOGIN - No session for protected path:",
      req.nextUrl.pathname,
    );
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("returnUrl", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isProtectedPath && session) {
    console.log(
      "✅ ALLOWING ACCESS - Valid session for protected path:",
      req.nextUrl.pathname,
    );
  }

  // Redirect to dashboard if accessing login/register with valid session
  if (
    session &&
    (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register")
  ) {
    const redirectUrl = new URL("/music", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, videos, audio files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3|mp4|wav)$).*)',
  ],
};
