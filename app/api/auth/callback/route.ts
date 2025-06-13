
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const returnUrl = requestUrl.searchParams.get("returnUrl") || "/music";

  // Get Vietnam time for logging
  const now = new Date();
  const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  const timestamp = vietnamTime.toISOString().replace('T', ' ').split('.')[0];
  
  console.log(`[${timestamp}] 🔗 Auth callback received:`);
  console.log(`[${timestamp}] 📥 Full URL: ${requestUrl.toString()}`);
  console.log(`[${timestamp}] 🔑 Code: ${code ? 'present' : 'missing'}`);
  console.log(`[${timestamp}] 📍 Return URL: ${returnUrl}`);

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.log(`[${timestamp}] ❌ Session exchange error:`, error.message);
      } else {
        console.log(`[${timestamp}] ✅ Session created for user:`, data.user?.email || 'unknown');
      }
    } catch (error) {
      console.log(`[${timestamp}] ❌ Exception during session exchange:`, error);
    }
  }

  // Redirect to the return URL or default to music page
  const redirectUrl = new URL(returnUrl, requestUrl.origin);
  console.log(`[${timestamp}] 🎯 Redirecting to: ${redirectUrl.toString()}`);
  
  return NextResponse.redirect(redirectUrl);
}
