// import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// // Cache session for a short time to avoid excessive requests
// const sessionCache = new Map<string, { session: any; timestamp: number }>();
// const CACHE_DURATION = 10000; // 10 seconds

// export async function middleware(req: NextRequest) {
//   const res = NextResponse.next();
//   const supabase = createMiddlewareClient({ req, res });

//   // Skip middleware for public routes and static files
//   const publicPaths = ["/",
//     "/login",
//     "/register",
//     "/music",
//     "/album",
//     "/artist"];
//   const skipPaths = [
//     "/api",
//     "/_next",
//     "/favicon.ico",
//     "/images",
//     "/file.svg",
//     "/globe.svg",
//     "/next.svg",
//     "/vercel.svg",
//     "/window.svg",
//     "/__nextjs", // Next.js internal
//     "/sw.js", // Service worker
//     "/manifest.json",
//   ];

//   const isPublicPath = publicPaths.includes(req.nextUrl.pathname);
//   const shouldSkip =
//     skipPaths.some((path) => req.nextUrl.pathname.startsWith(path)) ||
//     (req.nextUrl.pathname.includes(".") && !req.nextUrl.pathname.includes("/")); // Skip files with extensions

//   if (isPublicPath || shouldSkip) {
//     return res;
//   }

//   // Check cache first
//   const cacheKey = req.headers.get("authorization") || "anonymous";
//   const now = Date.now();
//   const cached = sessionCache.get(cacheKey);

//   let session;
//   if (cached && now - cached.timestamp < CACHE_DURATION) {
//     session = cached.session;
//   } else {
//     // Get session only if not cached or cache expired
//     const {
//       data: { session: freshSession },
//       error,
//     } = await supabase.auth.getSession();
//     session = freshSession;

//     // Cache the session
//     sessionCache.set(cacheKey, { session, timestamp: now });

//     // Clean old cache entries
//     for (const [key, value] of Array.from(sessionCache.entries())) {
//       if (now - value.timestamp > CACHE_DURATION) {
//         sessionCache.delete(key);
//       }
//     }
//   }

//   // Only log for actual protected routes
//   if (
//     req.nextUrl.pathname.startsWith("/") &&
//     !req.nextUrl.pathname.includes(".")
//   ) {
//     // Get Vietnam time (GMT+7)
//     const now = new Date();
//     const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);

//     const year = vietnamTime.getFullYear();
//     const month = String(vietnamTime.getMonth() + 1).padStart(2, "0");
//     const day = String(vietnamTime.getDate()).padStart(2, "0");
//     const hours = String(vietnamTime.getHours()).padStart(2, "0");
//     const minutes = String(vietnamTime.getMinutes()).padStart(2, "0");
//     const seconds = String(vietnamTime.getSeconds()).padStart(2, "0");

//     const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

//     console.log(
//       `[${timestamp}] 👤 User:`,
//       session?.user?.email || "anonymous",
//       "accessing:",
//       req.nextUrl.pathname,
//     );
//   }

//   // Protected routes - require authentication
//   const protectedPaths = ["/dashboard", "/agreements", "/admin", "/right-management", "/library"];

//   const isProtectedPath = protectedPaths.some((path) =>
//     req.nextUrl.pathname.startsWith(path),
//   );

//   // Redirect to login if accessing protected route without session
//   if (isProtectedPath && !session) {
//     // Get Vietnam time (GMT+7)
//     const now = new Date();
//     const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);

//     const year = vietnamTime.getFullYear();
//     const month = String(vietnamTime.getMonth() + 1).padStart(2, "0");
//     const day = String(vietnamTime.getDate()).padStart(2, "0");
//     const hours = String(vietnamTime.getHours()).padStart(2, "0");
//     const minutes = String(vietnamTime.getMinutes()).padStart(2, "0");
//     const seconds = String(vietnamTime.getSeconds()).padStart(2, "0");

//     const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

//     console.log(
//       `[${timestamp}] 🔒 Redirecting to login:`,
//       req.nextUrl.pathname,
//     );
//     const redirectUrl = new URL("/login", req.url);
//     redirectUrl.searchParams.set("returnUrl", req.nextUrl.pathname);
//     return NextResponse.redirect(redirectUrl);
//   }

//   // Check role-based permissions for protected routes
//   if (session && session.user?.email) {
//     // Import role middleware dynamically to avoid circular dependency
//     const { checkRoutePermission } = await import("./lib/middleware/role-middleware");

//     const permissionCheck = await checkRoutePermission(req.nextUrl.pathname, session.user.email);

//     if (!permissionCheck.allowed && permissionCheck.redirectTo) {
//       // Get Vietnam time for logging
//       const now = new Date();
//       const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
//       const year = vietnamTime.getFullYear();
//       const month = String(vietnamTime.getMonth() + 1).padStart(2, "0");
//       const day = String(vietnamTime.getDate()).padStart(2, "0");
//       const hours = String(vietnamTime.getHours()).padStart(2, "0");
//       const minutes = String(vietnamTime.getMinutes()).padStart(2, "0");
//       const seconds = String(vietnamTime.getSeconds()).padStart(2, "0");
//       const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

//       console.log(
//         `[${timestamp}] 🚫 Access denied for role ${permissionCheck.userRole}:`,
//         req.nextUrl.pathname,
//         "-> redirecting to:",
//         permissionCheck.redirectTo
//       );
//       const redirectUrl = new URL(permissionCheck.redirectTo, req.url);
//       return NextResponse.redirect(redirectUrl);
//     }
//   }

//   // Redirect to dashboard if accessing login/register with valid session
//   if (
//     session &&
//     (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register")
//   ) {
//     const redirectUrl = new URL("/music", req.url);
//     return NextResponse.redirect(redirectUrl);
//   }

//   return res;
// }

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - api (API routes)
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      * - images, videos, audio files
//      */
//     "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3|mp4|wav)$).*)",
//   ],
// };
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Cache session trong thời gian ngắn để tránh request quá nhiều
const sessionCache = new Map<string, { session: any; timestamp: number }>();
const CACHE_DURATION = 10000; // 10 giây

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Chỉ các routes thực sự public (không cần middleware)
  const publicPaths = [
    "/",
    "/music",
    "/album", 
    "/artist"
  ];
  // Đã xóa "/login", "/register" khỏi publicPaths

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

  // Cải thiện path matching với startsWith
  const isPublicPath = publicPaths.some(path => 
    req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith(path)
  );
  
  const shouldSkip =
    skipPaths.some((path) => req.nextUrl.pathname.startsWith(path)) ||
    (req.nextUrl.pathname.includes(".") && !req.nextUrl.pathname.includes("/")); // Bỏ qua files có extension

  if (isPublicPath || shouldSkip) {
    // Routes nhanh - không xử lý middleware
    return res;
  }

  // Từ đây, middleware chạy cho auth routes và protected routes
  console.log(`Middleware đang xử lý: ${req.nextUrl.pathname}${req.nextUrl.search}`);

  // Kiểm tra cache trước
  const cacheKey = req.headers.get("authorization") || "anonymous";
  const now = Date.now();
  const cached = sessionCache.get(cacheKey);

  let session;
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    session = cached.session;
  } else {
    // Lấy session mới nếu cache hết hạn
    const {
      data: { session: freshSession },
      error,
    } = await supabase.auth.getSession();
    session = freshSession;

    // Cache session
    sessionCache.set(cacheKey, { session, timestamp: now });

    // Dọn dẹp cache cũ
    for (const [key, value] of Array.from(sessionCache.entries())) {
      if (now - value.timestamp > CACHE_DURATION) {
        sessionCache.delete(key);
      }
    }
  }

  // Lấy giờ Việt Nam để logging
  const vietnamTime = new Date(now + 7 * 60 * 60 * 1000);
  const timestamp = vietnamTime.toISOString().slice(0, 19).replace('T', ' ');

  // Xử lý auth routes thông minh
  const isAuthRoute = req.nextUrl.pathname.startsWith("/login") || 
                     req.nextUrl.pathname.startsWith("/register");

  if (isAuthRoute) {
    console.log(`Route xác thực: ${req.nextUrl.pathname}${req.nextUrl.search}`);
    
    // Chỉ redirect nếu user đã đăng nhập VÀ không phải OAuth callback
    if (session && 
        (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register") &&
        !req.nextUrl.searchParams.has("code") && 
        !req.nextUrl.searchParams.has("token_hash") &&
        !req.nextUrl.searchParams.has("access_token")) {
      
      console.log(`[${timestamp}] Chuyển hướng user đã đăng nhập về /music`);
      const redirectUrl = new URL("/music", req.url);
      return NextResponse.redirect(redirectUrl);
    }
    
    // Cho phép OAuth callbacks và auth flows tiếp tục
    return res;
  }

  // Routes được bảo vệ - yêu cầu xác thực
  const protectedPaths = [
    "/dashboard", 
    "/agreements", 
    "/admin", 
    "/right-management", 
    "/library"
  ];

  const isProtectedPath = protectedPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path),
  );

  // Chuyển hướng về login nếu truy cập protected route mà chưa đăng nhập
  if (isProtectedPath && !session) {
    console.log(`[${timestamp}] Chuyển hướng về login: ${req.nextUrl.pathname}`);
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("returnUrl", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Kiểm tra quyền dựa trên role cho protected routes
  if (session && session.user?.email && isProtectedPath) {
    // Import role middleware động để tránh circular dependency
    const { checkRoutePermission } = await import("./lib/middleware/role-middleware");

    const permissionCheck = await checkRoutePermission(req.nextUrl.pathname, session.user.email);

    if (!permissionCheck.allowed && permissionCheck.redirectTo) {
      console.log(
        `[${timestamp}] Từ chối truy cập cho role ${permissionCheck.userRole}:`,
        req.nextUrl.pathname,
        "-> chuyển hướng về:",
        permissionCheck.redirectTo
      );
      const redirectUrl = new URL(permissionCheck.redirectTo, req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Log truy cập thành công
  if (isProtectedPath || isAuthRoute) {
    console.log(
      `[${timestamp}] Cho phép truy cập:`,
      session?.user?.email || "anonymous",
      "->", 
      req.nextUrl.pathname,
    );
  }

  return res;
}

// Matcher cụ thể - chỉ chạy middleware cho routes cần thiết
export const config = {
  matcher: [
    /*
     * Chỉ match các routes cụ thể cần xử lý middleware:
     * - Auth routes: /login, /register (bao gồm sub-paths cho OAuth)
     * - Protected routes: /dashboard, /agreements, etc.
     */
    "/dashboard/:path*",
    "/agreements/:path*", 
    "/admin/:path*",
    "/right-management/:path*",
    "/library/:path*",
    "/login/:path*",        // Xử lý OAuth callbacks
    "/register/:path*",     // Xử lý registration flows
    "/auth/:path*"          // Xử lý auth flows khác
  ],
};