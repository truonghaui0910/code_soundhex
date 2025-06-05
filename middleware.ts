import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Skip middleware for public routes and static files
  const publicPaths = ["/", "/login", "/register", "/api", "/_next", "/favicon.ico"];
  const isPublicPath = publicPaths.some(path => req.nextUrl.pathname.startsWith(path));
  
  if (isPublicPath) {
    return res;
  }

  // Try to get session and refresh if needed
  let { data: { session } } = await supabase.auth.getSession();
  
  // If no session, try to refresh
  if (!session) {
    const { data: refreshData } = await supabase.auth.refreshSession();
    session = refreshData.session;
  }
  
  console.log('Middleware session check:', !!session, req.nextUrl.pathname);

  // Protected routes
  const protectedPaths = ["/dashboard", "/license", "/agreements", "/album", "/music", "/right-management"];
  const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path));

  // Redirect to login if accessing protected route without session
  if (isProtectedPath && !session) {
    const redirectUrl = new URL("/login", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to dashboard if accessing login/register with valid session
  if (session && (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register")) {
    const redirectUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};