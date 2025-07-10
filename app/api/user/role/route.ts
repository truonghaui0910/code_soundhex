
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { UserRoleService } from "@/lib/services/user-role-service";

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Simply get user role from database (no automatic checking/updating)
    const userRole = await UserRoleService.getUserRoleByEmail(session.user.email);

    return NextResponse.json({ 
      role: userRole,
      email: session.user.email 
    });
  } catch (error) {
    console.error('Error getting user role:', error);
    return NextResponse.json(
      { error: "Failed to get user role" },
      { status: 500 }
    );
  }
}
