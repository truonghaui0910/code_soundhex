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
      agreementLogger.logError('AGREEMENT_CREATE_VALIDATION_ERROR', 'No rights selected', {
        userEmail,
        requestData: requestBody,
        duration: Date.now() - startTime
      });
      return NextResponse.json(
        { error: "At least one right must be selected" },
        { status: 400 }
      );
    }
    
    // Step 1: Call the first API to get the submission_id
    const submissionApiStart = Date.now();
    const submissionRequestBody = {
      template_id: 3,
      emails: userEmail
    };
    
    agreementLogger.logInfo('AGREEMENT_CREATE_API1_START', {
      userEmail,
      requestData: submissionRequestBody,
      duration: Date.now() - startTime
    });

    const submissionResponse = await fetch('https://docs.360digital.fm/api/submissions/emails', {
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
        url: 'https://docs.360digital.fm/api/submissions/emails',
        method: 'POST',
        status: submissionResponse.status,
        response: errorText,
        duration: Date.now() - submissionApiStart
      });
      
      agreementLogger.logError('AGREEMENT_CREATE_API1_ERROR', `Submission API error: ${submissionResponse.status}`, {
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
      url: 'https://docs.360digital.fm/api/submissions/emails',
      method: 'POST',
      status: submissionResponse.status,
      response: submissionData,
      duration: Date.now() - submissionApiStart
    });
    
    agreementLogger.logInfo('AGREEMENT_CREATE_API1_SUCCESS', {
      userEmail,
      requestData: submissionRequestBody,
      responseData: submissionData,
      duration: Date.now() - startTime
    });
    
    if (!submissionData || !submissionData[0] || !submissionData[0].submission_id) {
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
    
    // Step 2: Prepare the values for the PATCH request
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
    
    agreementLogger.logInfo('AGREEMENT_CREATE_VALUES_PREPARED', {
      userEmail,
      submissionId,
      requestData: values,
      duration: Date.now() - startTime
    });
    
    // Step 3: Call the second API to update the submitter with the values
    const updateApiStart = Date.now();
    const updateRequestBody = {
      values: JSON.stringify(values)
    };
    
    agreementLogger.logInfo('AGREEMENT_CREATE_API2_START', {
      userEmail,
      submissionId,
      requestData: updateRequestBody,
      duration: Date.now() - startTime
    });

    const updateResponse = await fetch(`http://178.156.150.2:8083/items/submitters/${submissionId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.TEMPLATES_API_BEARER_TOKEN!}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateRequestBody)
    });
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      apiCalls.push({
        url: `http://178.156.150.2:8083/items/submitters/${submissionId}`,
        method: 'PATCH',
        status: updateResponse.status,
        response: errorText,
        duration: Date.now() - updateApiStart
      });
      
      agreementLogger.logError('AGREEMENT_CREATE_API2_ERROR', `Update API error: ${updateResponse.status}`, {
        userEmail,
        submissionId,
        requestData: updateRequestBody,
        responseData: errorText,
        apiCalls,
        duration: Date.now() - startTime
      });
      
      return NextResponse.json(
        { error: `Failed to update submission: ${updateResponse.status}` },
        { status: 500 }
      );
    }
    
    // Handle empty or non-JSON response
    let updateData = null;
    const responseText = await updateResponse.text();
    if (responseText.trim()) {
      try {
        updateData = JSON.parse(responseText);
      } catch (parseError) {
        updateData = { success: true, rawResponse: responseText };
        agreementLogger.logWarn('AGREEMENT_CREATE_API2_NON_JSON', {
          userEmail,
          submissionId,
          responseData: responseText,
          duration: Date.now() - startTime
        });
      }
    } else {
      updateData = { success: true };
      agreementLogger.logWarn('AGREEMENT_CREATE_API2_EMPTY_RESPONSE', {
        userEmail,
        submissionId,
        duration: Date.now() - startTime
      });
    }
    
    apiCalls.push({
      url: `http://178.156.150.2:8083/items/submitters/${submissionId}`,
      method: 'PATCH',
      status: updateResponse.status,
      response: updateData,
      duration: Date.now() - updateApiStart
    });
    
    const finalResponse = {
      success: true,
      message: "Agreement saved successfully",
      data: {
        submissionId,
        values
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