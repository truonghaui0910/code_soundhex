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
    
    // Validate data is array before filtering
    if (!Array.isArray(data)) {
      console.log("API response is not an array:", data);
      return NextResponse.json([]);
    }
    
    // Filter sensitive data for security
    const filteredData = data.map((agreement: any) => ({
      id: agreement.id,
      created_at: agreement.created_at,
      updated_at: agreement.updated_at,
      status: agreement.status,
      completed_at: agreement.completed_at,
      audit_log_url: agreement.audit_log_url,
      combined_document_url: agreement.combined_document_url,
      template: agreement.template,
      created_by_user: agreement.created_by_user,
      // Only include essential submitter info for current user
      submitters: agreement.submitters.map((submitter: any) => ({
        id: submitter.id,
        email: submitter.email,
        status: submitter.status,
        completed_at: submitter.completed_at,
        role: submitter.role
        // Remove sensitive fields: slug, uuid, name
      }))
    }));
    
    // Return the filtered data
    return NextResponse.json(filteredData);
    
  } catch (err) {
    console.error("Error fetching agreements:", err);
    return NextResponse.json(
      { error: "Failed to fetch agreements", message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}