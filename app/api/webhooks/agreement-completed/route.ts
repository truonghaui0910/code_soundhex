
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { UserRoleService } from "@/lib/services/user-role-service";

interface WebhookData {
  event_type: string;
  timestamp: string;
  data: {
    id: number;
    submission_id: number;
    email: string;
    status: string;
    role: string;
    completed_at: string | null;
    submission: {
      id: number;
      status: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get("authorization");
    const webhookSecret = process.env.WEBHOOK_SECRET;
    
    if (!webhookSecret || authHeader !== `Bearer ${webhookSecret}`) {
      console.error("Unauthorized webhook request");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const webhookData: WebhookData = await request.json();
    
    // Validate webhook data
    if (webhookData.event_type !== "form.completed") {
      return NextResponse.json(
        { error: "Invalid event type" },
        { status: 400 }
      );
    }

    if (webhookData.data.status !== "completed") {
      return NextResponse.json(
        { error: "Form not completed" },
        { status: 400 }
      );
    }

    const submissionId = webhookData.data.submission_id;
    
    if (!submissionId) {
      return NextResponse.json(
        { error: "Missing submission_id" },
        { status: 400 }
      );
    }

    console.log(`Processing webhook for submission_id: ${submissionId}`);

    // Call external API to get submission details
    const apiBaseUrl = process.env.FORM_SUBMISSION_API_BASE_URL || 'https://docs.360digital.fm/api';
    const response = await fetch(
      `${apiBaseUrl}/submissions/${submissionId}`,
      {
        headers: {
          'X-Auth-Token': process.env.FORM_SUBMISSION_API_TOKEN!
        }
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch submission ${submissionId}: ${response.status}`);
      return NextResponse.json(
        { error: "Failed to fetch submission details" },
        { status: 500 }
      );
    }

    const submissionData = await response.json();
    
    // Find the artist's email from submitters
    let artistEmail: string | null = null;
    
    if (submissionData.submitters && Array.isArray(submissionData.submitters)) {
      const artistSubmitter = submissionData.submitters.find(
        (submitter: any) => submitter.role?.toLowerCase() === 'artist'
      );
      
      if (artistSubmitter && artistSubmitter.email) {
        artistEmail = artistSubmitter.email;
      }
    }

    if (!artistEmail) {
      console.error(`No artist email found in submission ${submissionId}`);
      return NextResponse.json(
        { error: "Artist email not found in submission" },
        { status: 400 }
      );
    }

    console.log(`Found artist email: ${artistEmail} for submission ${submissionId}`);

    // Check if the artist submitter has completed status
    const artistSubmitter = submissionData.submitters.find(
      (submitter: any) => submitter.role?.toLowerCase() === 'artist' && submitter.email === artistEmail
    );

    if (!artistSubmitter || artistSubmitter.status?.toLowerCase() !== 'completed') {
      console.log(`Artist ${artistEmail} has not completed the agreement yet`);
      return NextResponse.json(
        { message: "Artist has not completed the agreement" },
        { status: 200 }
      );
    }

    // Update user role to music_provider
    const currentRole = await UserRoleService.getUserRoleByEmail(artistEmail);
    
    if (currentRole === 'user') {
      const updateSuccess = await UserRoleService.updateUserRole(artistEmail, 'music_provider');
      
      if (updateSuccess) {
        console.log(`Successfully updated role to music_provider for ${artistEmail}`);
        return NextResponse.json({
          success: true,
          message: `Role updated to music_provider for ${artistEmail}`,
          data: {
            email: artistEmail,
            oldRole: currentRole,
            newRole: 'music_provider',
            submissionId
          }
        });
      } else {
        console.error(`Failed to update role for ${artistEmail}`);
        return NextResponse.json(
          { error: "Failed to update user role" },
          { status: 500 }
        );
      }
    } else {
      console.log(`User ${artistEmail} already has role: ${currentRole}`);
      return NextResponse.json({
        success: true,
        message: `User already has role: ${currentRole}`,
        data: {
          email: artistEmail,
          currentRole,
          submissionId
        }
      });
    }

  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
