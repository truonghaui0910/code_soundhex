import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Cache session trong thời gian ngắn để tránh request quá nhiều
const sessionCache = new Map<string, { session: any; timestamp: number }>();
const CACHE_DURATION = 5000; // Giảm xuống 5 giây để tránh stale session

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Routes hoàn toàn public (không cần middleware)
  const publicPaths = [
    "/",
    "/music",
    "/album", 
    "/artist",
    "/track",
  ];

  // Static files và API routes
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
    "/__nextjs",
    "/sw.js",
    "/manifest.json",
  ];

  // Kiểm tra public paths
  const isPublicPath = publicPaths.some(path => 
    req.nextUrl.pathname === path || 
    (path !== "/" && req.nextUrl.pathname.startsWith(path + "/"))
  );
  
  // Kiểm tra static files
  const shouldSkip = skipPaths.some((path) => req.nextUrl.pathname.startsWith(path)) ||
    (req.nextUrl.pathname.includes(".") && 
     !req.nextUrl.pathname.startsWith("/login") && 
     !req.nextUrl.pathname.startsWith("/register"));

  if (isPublicPath || shouldSkip) {
    return res;
  }

  console.log(`🔍 Middleware processing: ${req.nextUrl.pathname}${req.nextUrl.search}`);

  // Tạo cache key dựa trên cookie session thay vì authorization header
  const sessionCookie = req.cookies.get('sb-access-token')?.value || 
                       req.cookies.get('supabase-auth-token')?.value || 
                       'anonymous';
  const cacheKey = sessionCookie;
  const now = Date.now();
  const cached = sessionCache.get(cacheKey);

  let session;
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    session = cached.session;
    console.log("📋 Using cached session");
  } else {
    console.log("🔄 Fetching fresh session");
    try {
      const { data: { session: freshSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("❌ Session error:", error);
        session = null;
      } else {
        session = freshSession;
      }

      // Cache session
      sessionCache.set(cacheKey, { session, timestamp: now });

      // Dọn dẹp cache cũ
      for (const [key, value] of Array.from(sessionCache.entries())) {
        if (now - value.timestamp > CACHE_DURATION) {
          sessionCache.delete(key);
        }
      }
    } catch (error) {
      console.error("💥 Session fetch failed:", error);
      session = null;
    }
  }

  // Tạo timestamp cho logging
  const vietnamTime = new Date(now + 7 * 60 * 60 * 1000);
  const timestamp = vietnamTime.toISOString().slice(0, 19).replace('T', ' ');

  // Định nghĩa auth routes và protected routes
  const isAuthRoute = req.nextUrl.pathname.startsWith("/login") || 
                     req.nextUrl.pathname.startsWith("/register");

  const protectedPaths = [
    "/dashboard", 
    "/agreements", 
    "/upload",
    "/admin", 
    "/right-management", 
    "/library"
  ];

  const isProtectedPath = protectedPaths.some(path =>
    req.nextUrl.pathname.startsWith(path)
  );

  // Xử lý auth routes
  if (isAuthRoute) {
    console.log(`🔐 Auth route: ${req.nextUrl.pathname}${req.nextUrl.search}`);
    
    // Nếu user đã đăng nhập và truy cập login/register (không phải callback)
    if (session && 
        (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register") &&
        !req.nextUrl.searchParams.has("code") && 
        !req.nextUrl.searchParams.has("token_hash") &&
        !req.nextUrl.searchParams.has("access_token") &&
        !req.nextUrl.searchParams.has("refresh_token")) {
      
      console.log(`[${timestamp}] ↩️  Redirecting authenticated user to /music`);
      return NextResponse.redirect(new URL("/music", req.url));
    }
    
    // Cho phép auth flows tiếp tục
    return res;
  }

  // Xử lý protected routes
  if (isProtectedPath) {
    // Chuyển hướng về login nếu chưa đăng nhập
    if (!session) {
      console.log(`[${timestamp}] 🔒 Redirecting to login: ${req.nextUrl.pathname}`);
      const redirectUrl = new URL("/login", req.url);
      redirectUrl.searchParams.set("returnUrl", req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(redirectUrl);
    }

    // Kiểm tra quyền dựa trên role
    if (session.user?.email) {
      try {
        const { checkRoutePermission } = await import("./lib/middleware/role-middleware");
        const permissionCheck = await checkRoutePermission(req.nextUrl.pathname, session.user.email);

        if (!permissionCheck.allowed && permissionCheck.redirectTo) {
          console.log(
            `[${timestamp}] 🚫 Access denied for role ${permissionCheck.userRole}:`,
            req.nextUrl.pathname,
            "-> redirecting to:",
            permissionCheck.redirectTo
          );
          return NextResponse.redirect(new URL(permissionCheck.redirectTo, req.url));
        }
      } catch (error) {
        console.error("❌ Role check failed:", error);
        // Cho phép tiếp tục nếu role check failed
      }
    }

    console.log(
      `[${timestamp}] ✅ Access granted:`,
      session.user?.email || "anonymous",
      "->", 
      req.nextUrl.pathname
    );
  }

  return res;
}

// Matcher config cải thiện - bao gồm tất cả routes cần thiết
export const config = {
  matcher: [
    /*
     * Match tất cả routes trừ:
     * - API routes (/api/*)
     * - Static files (_next/static, _next/image, favicon.ico)
     * - Static assets (images, videos, audio files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3|mp4|wav|ico|css|js)$).*)",
  ],
};