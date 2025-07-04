// app/api/agreements/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { agreementLogger } from "@/lib/services/agreement-logger";

// Type for agreement data
interface SaveAgreementRequest {
  selectedRights: {
    id: string;
    checked: boolean;
  }[];
  formFields: {
    id: string;
    value: string;
  }[];
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let userEmail: string | undefined;
  let requestBody: SaveAgreementRequest | undefined;
  let submissionId: string | undefined;
  const apiCalls: any[] = [];

  try {
    // Get the current user's email
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      agreementLogger.logError('AGREEMENT_CREATE_UNAUTHORIZED', 'No session found', {
        duration: Date.now() - startTime
      });
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    userEmail = session.user.email;
    
    if (!userEmail) {
      agreementLogger.logError('AGREEMENT_CREATE_NO_EMAIL', 'User email not available', {
        duration: Date.now() - startTime
      });
      return NextResponse.json(
        { error: "User email not available" },
        { status: 400 }
      );
    }
    
    // Parse the JSON body
    requestBody = await request.json();
    
    agreementLogger.logInfo('AGREEMENT_CREATE_START', {
      userEmail,
      requestData: requestBody,
      duration: Date.now() - startTime
    });
    
    // Validate data
    if (!requestBody.selectedRights || requestBody.selectedRights.length === 0) {
      return NextResponse.json(
        { error: "At least one right must be selected" },
        { status: 400 }
      );
    }
    
    // Step 1: Prepare the values for the request
    const values: { [key: string]: string | boolean } = {};
    
    // Add checkbox values
    requestBody.selectedRights.forEach(right => {
      if (right.checked) {
        values[right.id] = true;
      }
    });
    
    // Add text field values
    requestBody.formFields.forEach(field => {
      if (field.value.trim()) {
        values[field.id] = field.value;
      }
    });
    
    // Step 2: Call the API to create submission
    const submissionApiStart = Date.now();
    const submissionRequestBody = {
      template_id: 3,
      submitters: [
        {
          name: userEmail,
          role: "Artist",
          email: userEmail,
          values: values
        },
        {
          role: "Soundhex",
          email: process.env.AGREEMENT_EMAIL_ADMIN!
        }
      ]
    };
    
    agreementLogger.logInfo('AGREEMENT_CREATE_API_START', {
      userEmail,
      requestData: submissionRequestBody,
      duration: Date.now() - startTime
    });

    const submissionResponse = await fetch('https://docs.360digital.fm/api/submissions', {
      method: 'POST',
      headers: {
        'X-Auth-Token': process.env.FORM_SUBMISSION_API_TOKEN!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(submissionRequestBody)
    });
    
    if (!submissionResponse.ok) {
      const errorText = await submissionResponse.text();
      apiCalls.push({
        url: 'https://docs.360digital.fm/api/submissions',
        method: 'POST',
        status: submissionResponse.status,
        response: errorText,
        duration: Date.now() - submissionApiStart
      });
      
      agreementLogger.logError('AGREEMENT_CREATE_API_ERROR', `Submission API error: ${submissionResponse.status}`, {
        userEmail,
        requestData: submissionRequestBody,
        responseData: errorText,
        apiCalls,
        duration: Date.now() - startTime
      });
      
      return NextResponse.json(
        { error: `Failed to create submission: ${submissionResponse.status}` },
        { status: 500 }
      );
    }
    
    const submissionData = await submissionResponse.json();
    
    apiCalls.push({
      url: 'https://docs.360digital.fm/api/submissions',
      method: 'POST',
      status: submissionResponse.status,
      response: submissionData,
      duration: Date.now() - submissionApiStart
    });
    
    agreementLogger.logInfo('AGREEMENT_CREATE_API_SUCCESS', {
      userEmail,
      requestData: submissionRequestBody,
      responseData: submissionData,
      duration: Date.now() - startTime
    });
    
    // API returns array of submitters, get submission_id from first submitter
    if (!Array.isArray(submissionData) || submissionData.length === 0 || !submissionData[0].submission_id) {
      agreementLogger.logError('AGREEMENT_CREATE_INVALID_SUBMISSION_DATA', 'Invalid submission data received', {
        userEmail,
        responseData: submissionData,
        apiCalls,
        duration: Date.now() - startTime
      });
      return NextResponse.json(
        { error: "Invalid submission data received" },
        { status: 500 }
      );
    }
    
    submissionId = submissionData[0].submission_id;
    
    const finalResponse = {
      success: true,
      message: "Agreement saved successfully",
      data: {
        submissionId,
        submitters: submissionData
      }
    };
    
    agreementLogger.logInfo('AGREEMENT_CREATE_SUCCESS', {
      userEmail,
      submissionId,
      requestData: requestBody,
      responseData: finalResponse,
      apiCalls,
      duration: Date.now() - startTime
    });
    
    // Return success response
    return NextResponse.json(finalResponse);
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    
    agreementLogger.logError('AGREEMENT_CREATE_EXCEPTION', errorMessage, {
      userEmail,
      submissionId,
      requestData: requestBody,
      apiCalls,
      duration: Date.now() - startTime
    });
    
    return NextResponse.json(
      { error: "Failed to save agreement", message: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  let userEmail: string | undefined;
  let submissionId: string | null = null;

  try {
    // Get the current user's session
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      agreementLogger.logError('AGREEMENT_GET_UNAUTHORIZED', 'No session found', {
        duration: Date.now() - startTime
      });
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    userEmail = session.user.email;
    
    // Get submission ID from URL params
    const { searchParams } = new URL(request.url);
    submissionId = searchParams.get('id');
    
    if (!submissionId) {
      agreementLogger.logError('AGREEMENT_GET_NO_ID', 'Submission ID is required', {
        userEmail,
        duration: Date.now() - startTime
      });
      return NextResponse.json(
        { error: "Submission ID is required" },
        { status: 400 }
      );
    }
    
    agreementLogger.logInfo('AGREEMENT_GET_START', {
      userEmail,
      submissionId,
      duration: Date.now() - startTime
    });
    
    // Call the external API to get submission details
    const apiStart = Date.now();
    const response = await fetch(
      `https://docs.360digital.fm/api/submissions/${submissionId}`,
      {
        headers: {
          'X-Auth-Token': process.env.FORM_SUBMISSION_API_TOKEN!
        }
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      agreementLogger.logError('AGREEMENT_GET_API_ERROR', `API error: ${response.status}`, {
        userEmail,
        submissionId,
        responseData: errorText,
        apiCalls: [{
          url: `https://docs.360digital.fm/api/submissions/${submissionId}`,
          method: 'GET',
          status: response.status,
          response: errorText,
          duration: Date.now() - apiStart
        }],
        duration: Date.now() - startTime
      });
      
      return NextResponse.json(
        { error: `Failed to fetch submission details: ${response.status}` },
        { status: 500 }
      );
    }
    
    const data = await response.json();
    
    agreementLogger.logInfo('AGREEMENT_GET_SUCCESS', {
      userEmail,
      submissionId,
      responseData: data,
      apiCalls: [{
        url: `https://docs.360digital.fm/api/submissions/${submissionId}`,
        method: 'GET',
        status: response.status,
        response: data,
        duration: Date.now() - apiStart
      }],
      duration: Date.now() - startTime
    });
    
    // Return the data
    return NextResponse.json(data);
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    
    agreementLogger.logError('AGREEMENT_GET_EXCEPTION', errorMessage, {
      userEmail,
      submissionId,
      duration: Date.now() - startTime
    });
    
    return NextResponse.json(
      { error: "Failed to fetch submission details", message: errorMessage },
      { status: 500 }
    );
  }
}