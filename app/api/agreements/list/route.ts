// app/api/agreements/list/route.ts
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    // Get the current user's email
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const userEmail = session.user.email;
    
    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not available" },
        { status: 400 }
      );
    }
    
    // Call the external API to get agreements
    const response = await fetch(
      `https://docs.360digital.fm/api/submissions?q=${encodeURIComponent(userEmail)}&limit=100`,
      {
        headers: {
          'X-Auth-Token': process.env.FORM_SUBMISSION_API_TOKEN!
        }
      }
    );
    
    if (!response.ok) {
      console.error('API error:', await response.text());
      return NextResponse.json(
        { error: `Failed to fetch agreements: ${response.status}` },
        { status: 500 }
      );
    }
    
    const data = await response.json();
    
    // Return the data
    return NextResponse.json(data);
    
  } catch (err) {
    console.error("Error fetching agreements:", err);
    return NextResponse.json(
      { error: "Failed to fetch agreements", message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}