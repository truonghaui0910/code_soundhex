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

    // Import UserRoleService to check role
    const { UserRoleService } = await import("@/lib/services/user-role-service");
    const userRole = await UserRoleService.getUserRoleByEmail(userEmail);
    
    // Use admin email for admin users, regular email for others
    const queryEmail = userRole === 'admin' 
      ? (process.env.AGREEMENT_EMAIL_ADMIN || userEmail)
      : userEmail;
    
    // Call the external API to get agreements
    const apiBaseUrl = process.env.FORM_SUBMISSION_API_BASE_URL || 'https://docs.360digital.fm/api';
    const response = await fetch(
      `${apiBaseUrl}/submissions?q=${encodeURIComponent(queryEmail)}&limit=100`,
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
    
    // Handle API response structure - data is wrapped in data property
    let agreementsArray = data;
    
    // Check if data has nested data property (API returns { data: [...], pagination: {...} })
    if (data && data.data && Array.isArray(data.data)) {
      agreementsArray = data.data;
    } else if (!Array.isArray(data)) {
      console.log("API response is not an array:", data);
      return NextResponse.json([]);
    }
    
    // Filter sensitive data for security and update status logic
    const filteredData = agreementsArray.map((agreement: any) => {
      // Find current user's submitter
      const currentUserSubmitter = agreement.submitters.find((s: any) => s.email === userEmail);
      
      // Determine display status based on current user's submission status
      let displayStatus = agreement.status;
      let userHasCompleted = false;
      
      if (currentUserSubmitter) {
        userHasCompleted = currentUserSubmitter.status?.toLowerCase() === 'completed';
        
        // If current user has completed but overall status is still pending
        // it means they're waiting for the other party to sign
        if (userHasCompleted && agreement.status?.toLowerCase() === 'pending') {
          displayStatus = 'waiting_for_other_party';
        }
      }

      // Special logic for admin view: if artist has completed but overall status is pending
      // show 'waiting_for_soundhex' to indicate artist submitted and waiting for SoundHex
      if (userRole === 'admin') {
        const artistSubmitter = agreement.submitters.find((s: any) => s.role?.toLowerCase() === 'artist');
        if (artistSubmitter && 
            artistSubmitter.status?.toLowerCase() === 'completed' && 
            agreement.status?.toLowerCase() === 'pending') {
          displayStatus = 'waiting_for_soundhex';
        }
      }
      
      return {
        id: agreement.id,
        created_at: agreement.created_at,
        updated_at: agreement.updated_at,
        status: displayStatus,
        completed_at: agreement.completed_at,
        audit_log_url: agreement.audit_log_url,
        combined_document_url: agreement.combined_document_url,
        template: agreement.template,
        created_by_user: agreement.created_by_user,
        // Add user completion status for frontend logic
        user_has_completed: userHasCompleted,
        // Filter submitters to only include slug for current user
        submitters: agreement.submitters.map((submitter: any) => ({
          id: submitter.id,
          email: submitter.email,
          status: submitter.status,
          completed_at: submitter.completed_at,
          role: submitter.role,
          // Only include slug for current user, remove for others
          ...(submitter.email === userEmail ? { slug: submitter.slug } : {})
          // Remove sensitive fields: uuid, name for all users
        }))
      };
    });
    
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