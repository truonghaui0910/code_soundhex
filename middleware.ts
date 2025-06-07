import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
    "/sw.js",    // Service worker
    "/manifest.json"
  ];
  
  const isPublicPath = publicPaths.includes(req.nextUrl.pathname);
  const shouldSkip = skipPaths.some((path) => req.nextUrl.pathname.startsWith(path)) ||
                    req.nextUrl.pathname.includes('.') && !req.nextUrl.pathname.includes('/'); // Skip files with extensions

  if (isPublicPath || shouldSkip) {
    return res;
  }

  // Try to get session (no automatic refresh to avoid too many requests)
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  // Only log for actual protected routes
  if (req.nextUrl.pathname.startsWith('/') && !req.nextUrl.pathname.includes('.')) {
    console.log(
      "🔍 Middleware check:",
      req.nextUrl.pathname,
      "Session:",
      !!session
    );
  }

  // Protected routes - require authentication
  const protectedPaths = [
    "/dashboard",
    "/license", 
    "/agreements", 
    "/album",
    "/music",
    "/right-management",
    "/artist"
  ];
  
  const isProtectedPath = protectedPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );
  
  // Redirect to login if accessing protected route without session
  if (isProtectedPath && !session) {
    console.log("🔒 Redirecting to login:", req.nextUrl.pathname);
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("returnUrl", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
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
