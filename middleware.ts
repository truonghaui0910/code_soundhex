import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Try to get session and refresh if needed
  let { data: { session } } = await supabase.auth.getSession();
  
  // If no session, try to refresh
  if (!session) {
    await supabase.auth.refreshSession();
    const refreshedData = await supabase.auth.getSession();
    session = refreshedData.data.session;
  }

  // Nếu user không đăng nhập và cố truy cập vào route được bảo vệ
  if (!session 
    && (req.nextUrl.pathname.startsWith("/dashboard")
    || req.nextUrl.pathname.startsWith("/license")  
    || req.nextUrl.pathname.startsWith("/agreements"))) {
    const redirectUrl = new URL("/login", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/agreements/:path*", "/license/:path*"],
};