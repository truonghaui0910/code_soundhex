import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Cache session for a short time to avoid excessive requests
const sessionCache = new Map<string, { session: any; timestamp: number }>();
const CACHE_DURATION = 10000; // 10 seconds

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Skip middleware for public routes and static files
  const publicPaths = ["/", "/login", "/register"];
  const skipPaths = [
    "/api",
    "/_next",
    "/favicon.ico",
    "/images",
    "/file.svg",
    "/globe.svg",
    "/next.svg",
    "/vercel.svg",
    "/window.svg",
    "/__nextjs", // Next.js internal
    "/sw.js", // Service worker
    "/manifest.json",
  ];

  const isPublicPath = publicPaths.includes(req.nextUrl.pathname);
  const shouldSkip =
    skipPaths.some((path) => req.nextUrl.pathname.startsWith(path)) ||
    (req.nextUrl.pathname.includes(".") && !req.nextUrl.pathname.includes("/")); // Skip files with extensions

  if (isPublicPath || shouldSkip) {
    return res;
  }

  // Check cache first
  const cacheKey = req.headers.get("authorization") || "anonymous";
  const now = Date.now();
  const cached = sessionCache.get(cacheKey);

  let session;
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    session = cached.session;
  } else {
    // Get session only if not cached or cache expired
    const {
      data: { session: freshSession },
      error,
    } = await supabase.auth.getSession();
    session = freshSession;

    // Cache the session
    sessionCache.set(cacheKey, { session, timestamp: now });

    // Clean old cache entries
    for (const [key, value] of Array.from(sessionCache.entries())) {
      if (now - value.timestamp > CACHE_DURATION) {
        sessionCache.delete(key);
      }
    }
  }

  // Only log for actual protected routes
  if (
    req.nextUrl.pathname.startsWith("/") &&
    !req.nextUrl.pathname.includes(".")
  ) {
    // Get Vietnam time (GMT+7)
    const now = new Date();
    const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);

    const year = vietnamTime.getFullYear();
    const month = String(vietnamTime.getMonth() + 1).padStart(2, "0");
    const day = String(vietnamTime.getDate()).padStart(2, "0");
    const hours = String(vietnamTime.getHours()).padStart(2, "0");
    const minutes = String(vietnamTime.getMinutes()).padStart(2, "0");
    const seconds = String(vietnamTime.getSeconds()).padStart(2, "0");

    const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    console.log(
      `[${timestamp}] 👤 User:`,
      session?.user?.email || "anonymous",
      "accessing:",
      req.nextUrl.pathname,
    );
  }

  // Protected routes - require authentication
  const protectedPaths = ["/dashboard", "/agreements", "/music/upload", "/admin", "/right-management"];

  const isProtectedPath = protectedPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path),
  );

  // Redirect to login if accessing protected route without session
  if (isProtectedPath && !session) {
    // Get Vietnam time (GMT+7)
    const now = new Date();
    const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);

    const year = vietnamTime.getFullYear();
    const month = String(vietnamTime.getMonth() + 1).padStart(2, "0");
    const day = String(vietnamTime.getDate()).padStart(2, "0");
    const hours = String(vietnamTime.getHours()).padStart(2, "0");
    const minutes = String(vietnamTime.getMinutes()).padStart(2, "0");
    const seconds = String(vietnamTime.getSeconds()).padStart(2, "0");

    const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    console.log(
      `[${timestamp}] 🔒 Redirecting to login:`,
      req.nextUrl.pathname,
    );
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("returnUrl", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Check role-based permissions for protected routes
  if (session && session.user?.email) {
    // Import role middleware dynamically to avoid circular dependency
    const { checkRoutePermission } = await import("./lib/middleware/role-middleware");
    
    const permissionCheck = await checkRoutePermission(req.nextUrl.pathname, session.user.email);
    
    if (!permissionCheck.allowed && permissionCheck.redirectTo) {
      console.log(
        `[${timestamp}] 🚫 Access denied for role ${permissionCheck.userRole}:`,
        req.nextUrl.pathname,
        "-> redirecting to:",
        permissionCheck.redirectTo
      );
      const redirectUrl = new URL(permissionCheck.redirectTo, req.url);
      return NextResponse.redirect(redirectUrl);
    }
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
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3|mp4|wav)$).*)",
  ],
};
