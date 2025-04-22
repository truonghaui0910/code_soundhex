import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Nếu user không đăng nhập và cố truy cập vào route được bảo vệ
  if (!session 
    && (req.nextUrl.pathname.startsWith("/dashboard")
    || req.nextUrl.pathname.startsWith("/license")  
    || req.nextUrl.pathname.startsWith("/right-management"))) {
    const redirectUrl = new URL("/login", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/right-management/:path*"],
};