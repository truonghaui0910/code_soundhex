
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { UserRoleService } from "@/lib/services/user-role-service";
import { agreementLogger } from "@/lib/services/agreement-logger";

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
  const startTime = Date.now();
  let submissionId: number | null = null;
  let userEmail: string | null = null;

  try {
    // Verify webhook secret
    const authHeader = request.headers.get("authorization");
    const webhookSecret = process.env.WEBHOOK_SECRET;
    
    if (!webhookSecret || authHeader !== `Bearer ${webhookSecret}`) {
      agreementLogger.logError('WEBHOOK_UNAUTHORIZED', 'Invalid or missing authorization header', {
        operation: 'webhook_auth_failed',
        requestData: { authHeader: authHeader ? 'Bearer ***' : null },
        duration: Date.now() - startTime
      });
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const webhookData: WebhookData = await request.json();
    submissionId = webhookData.data?.submission_id;
    userEmail = webhookData.data?.email;

    agreementLogger.logInfo('WEBHOOK_DATA_RECEIVED', {
      operation: 'webhook_data_parsed',
      userEmail,
      submissionId,
      requestData: webhookData,
      duration: Date.now() - startTime
    });
    
    // Validate webhook data
    if (webhookData.event_type !== "form.completed") {
      agreementLogger.logError('WEBHOOK_INVALID_EVENT_TYPE', `Expected form.completed, got ${webhookData.event_type}`, {
        operation: 'webhook_validation_failed',
        userEmail,
        requestData: webhookData,
        duration: Date.now() - startTime
      });
      return NextResponse.json(
        { error: "Invalid event type" },
        { status: 400 }
      );
    }

    if (webhookData.data.status !== "completed") {
      agreementLogger.logError('WEBHOOK_FORM_NOT_COMPLETED', `Expected completed status, got ${webhookData.data.status}`, {
        operation: 'webhook_validation_failed',
        userEmail,
        submissionId,
        requestData: webhookData,
        duration: Date.now() - startTime
      });
      return NextResponse.json(
        { error: "Form not completed" },
        { status: 400 }
      );
    }
    
    if (!submissionId) {
      agreementLogger.logError('WEBHOOK_MISSING_SUBMISSION_ID', 'submission_id is missing from webhook data', {
        operation: 'webhook_validation_failed',
        userEmail,
        requestData: webhookData,
        duration: Date.now() - startTime
      });
      return NextResponse.json(
        { error: "Missing submission_id" },
        { status: 400 }
      );
    }

    // Call external API to get submission details
    const apiBaseUrl = process.env.FORM_SUBMISSION_API_BASE_URL || 'https://docs.360digital.fm/api';
    const apiUrl = `${apiBaseUrl}/submissions/${submissionId}`;
    const apiCallStart = Date.now();

    const response = await fetch(apiUrl, {
      headers: {
        'X-Auth-Token': process.env.FORM_SUBMISSION_API_TOKEN!
      }
    });

    const apiCallDuration = Date.now() - apiCallStart;

    if (!response.ok) {
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
      agreementLogger.logError('WEBHOOK_NO_ARTIST_EMAIL', `No artist email found in submission ${submissionId}`, {
        operation: 'artist_email_not_found',
        userEmail,
        submissionId,
        requestData: { submitters: submissionData.submitters },
        duration: Date.now() - startTime
      });
      return NextResponse.json(
        { error: "Artist email not found in submission" },
        { status: 400 }
      );
    }

    agreementLogger.logInfo('WEBHOOK_ARTIST_EMAIL_FOUND', {
      operation: 'artist_email_found',
      userEmail: artistEmail,
      submissionId,
      duration: Date.now() - startTime
    });

    // Check if the artist submitter has completed status
    const artistSubmitter = submissionData.submitters.find(
      (submitter: any) => submitter.role?.toLowerCase() === 'artist' && submitter.email === artistEmail
    );

    if (!artistSubmitter || artistSubmitter.status?.toLowerCase() !== 'completed') {
      agreementLogger.logWarn('WEBHOOK_ARTIST_NOT_COMPLETED', {
        operation: 'artist_not_completed',
        userEmail: artistEmail,
        submissionId,
        requestData: { 
          artistSubmitter: artistSubmitter || null,
          status: artistSubmitter?.status || 'not_found'
        },
        duration: Date.now() - startTime
      });
      return NextResponse.json(
        { message: "Artist has not completed the agreement" },
        { status: 200 }
      );
    }

    // Update user role to music_provider
    const roleCheckStart = Date.now();
    const currentRole = await UserRoleService.getUserRoleByEmail(artistEmail);
    
    agreementLogger.logInfo('WEBHOOK_CURRENT_ROLE_CHECKED', {
      operation: 'current_role_checked',
      userEmail: artistEmail,
      submissionId,
      responseData: { currentRole },
      duration: Date.now() - startTime
    });
    
    if (currentRole === 'user') {
      const roleUpdateStart = Date.now();
      const updateSuccess = await UserRoleService.updateUserRole(artistEmail, 'music_provider');
      const roleUpdateDuration = Date.now() - roleUpdateStart;
      
      if (updateSuccess) {
        const finalResponse = {
          success: true,
          message: `Role updated to music_provider for ${artistEmail}`,
          data: {
            email: artistEmail,
            oldRole: currentRole,
            newRole: 'music_provider',
            submissionId
          }
        };

        agreementLogger.logInfo('WEBHOOK_ROLE_UPDATE_SUCCESS', {
          operation: 'role_update_success',
          userEmail: artistEmail,
          submissionId,
          responseData: finalResponse,
          duration: Date.now() - startTime
        });

        return NextResponse.json(finalResponse);
      } else {
        agreementLogger.logError('WEBHOOK_ROLE_UPDATE_FAILED', `Failed to update role for ${artistEmail}`, {
          operation: 'role_update_failed',
          userEmail: artistEmail,
          submissionId,
          duration: Date.now() - startTime
        });
        return NextResponse.json(
          { error: "Failed to update user role" },
          { status: 500 }
        );
      }
    } else {
      const skipResponse = {
        success: true,
        message: `User already has role: ${currentRole}`,
        data: {
          email: artistEmail,
          currentRole,
          submissionId
        }
      };

      agreementLogger.logInfo('WEBHOOK_ROLE_UPDATE_SKIPPED', {
        operation: 'role_update_skipped',
        userEmail: artistEmail,
        submissionId,
        responseData: skipResponse,
        duration: Date.now() - startTime
      });

      return NextResponse.json(skipResponse);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    agreementLogger.logError('WEBHOOK_PROCESSING_ERROR', errorMessage, {
      operation: 'webhook_exception',
      userEmail,
      submissionId,
      error: errorMessage,
      duration: Date.now() - startTime
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
