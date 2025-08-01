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

  try {
    // Get the current user's email
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      agreementLogger.logError(
        "AGREEMENT_CREATE_UNAUTHORIZED",
        "No session found",
        {
          duration: Date.now() - startTime,
        },
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    userEmail = session.user.email;

    if (!userEmail) {
      agreementLogger.logError(
        "AGREEMENT_CREATE_NO_EMAIL",
        "User email not available",
        {
          duration: Date.now() - startTime,
        },
      );
      return NextResponse.json(
        { error: "User email not available" },
        { status: 400 },
      );
    }

    try {
      requestBody = await request.json();
    } catch (error) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!requestBody) {
      return NextResponse.json(
        { error: "Request body is required" },
        { status: 400 },
      );
    }

    if (!requestBody.formFields) {
      return NextResponse.json(
        { error: "Form fields are required" },
        { status: 400 },
      );
    }

    // Validate data
    if (
      !requestBody.selectedRights ||
      requestBody.selectedRights.length === 0
    ) {
      return NextResponse.json(
        { error: "At least one right must be selected" },
        { status: 400 },
      );
    }

    // Step 1: Prepare the values for the request
    const values: { [key: string]: string | boolean } = {};

    // Add checkbox values
    requestBody.selectedRights.forEach((right) => {
      if (right.checked) {
        values[right.id] = true;
      }
    });

    // Add text field values
    requestBody.formFields.forEach((field) => {
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
          values: values,
        },
        {
          role: "Soundhex",
          email: process.env.AGREEMENT_EMAIL_ADMIN!,
        },
      ],
    };

    const apiBaseUrl =
      process.env.FORM_SUBMISSION_API_BASE_URL ||
      "https://docs.360digital.fm/api";
    const submissionResponse = await fetch(`${apiBaseUrl}/submissions`, {
      method: "POST",
      headers: {
        "X-Auth-Token": process.env.FORM_SUBMISSION_API_TOKEN!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submissionRequestBody),
    });

    if (!submissionResponse.ok) {
      const errorText = await submissionResponse.text();

      agreementLogger.logError(
        "AGREEMENT_CREATE_API_ERROR",
        `Submission API error: ${submissionResponse.status}`,
        {
          userEmail,
          requestData: submissionRequestBody,
          responseData: errorText,
          duration: Date.now() - startTime,
        },
      );

      return NextResponse.json(
        { error: `Failed to create submission: ${submissionResponse.status}` },
        { status: 500 },
      );
    }

    const submissionData = await submissionResponse.json();

    // API returns array of submitters, get submission_id from first submitter
    if (
      !Array.isArray(submissionData) ||
      submissionData.length === 0 ||
      !submissionData[0].submission_id
    ) {
      agreementLogger.logError(
        "AGREEMENT_CREATE_INVALID_SUBMISSION_DATA",
        "Invalid submission data received",
        {
          userEmail,
          responseData: submissionData,
          duration: Date.now() - startTime,
        },
      );
      return NextResponse.json(
        { error: "Invalid submission data received" },
        { status: 500 },
      );
    }

    submissionId = submissionData[0].submission_id;

    // Filter to only return the current user's submitter data for security
    const userSubmitter = submissionData.find(
      (submitter) => submitter.email === userEmail,
    );

    if (!userSubmitter) {
      agreementLogger.logError(
        "AGREEMENT_CREATE_USER_SUBMITTER_NOT_FOUND",
        "User submitter not found in response",
        {
          userEmail,
          responseData: submissionData,
          duration: Date.now() - startTime,
        },
      );
      return NextResponse.json(
        { error: "User submitter not found" },
        { status: 500 },
      );
    }

    const finalResponse = {
      success: true,
      message: "Agreement saved successfully",
      data: {
        submissionId,
        submitter: userSubmitter,
      },
    };

    agreementLogger.logInfo("AGREEMENT_CREATE_SUCCESS", {
      userEmail,
      submissionId,
      requestData: requestBody,
      responseData: finalResponse,
      duration: Date.now() - startTime,
    });

    // Return success response
    return NextResponse.json(finalResponse);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";

    agreementLogger.logError("AGREEMENT_CREATE_EXCEPTION", errorMessage, {
      userEmail,
      submissionId,
      requestData: requestBody,
      duration: Date.now() - startTime,
    });

    return NextResponse.json(
      { error: "Failed to save agreement", message: errorMessage },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  let userEmail: string | undefined;
  let submissionId: string | undefined;

  try {
    // Get the current user's session
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      agreementLogger.logError(
        "AGREEMENT_GET_UNAUTHORIZED",
        "No session found",
        {
          duration: Date.now() - startTime,
        },
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    userEmail = session.user.email;

    // Get submission ID from URL params
    const { searchParams } = new URL(request.url);
    submissionId = searchParams.get("id") || undefined;

    if (!submissionId) {
      agreementLogger.logError(
        "AGREEMENT_GET_NO_ID",
        "Submission ID is required",
        {
          userEmail,
          duration: Date.now() - startTime,
        },
      );
      return NextResponse.json(
        { error: "Submission ID is required" },
        { status: 400 },
      );
    }

    agreementLogger.logInfo("AGREEMENT_GET_START", {
      userEmail,
      submissionId,
      duration: Date.now() - startTime,
    });

    // Call the external API to get submission details
    const apiStart = Date.now();
    const apiBaseUrl =
      process.env.FORM_SUBMISSION_API_BASE_URL ||
      "https://docs.360digital.fm/api";
    const apiUrl = `${apiBaseUrl}/submissions/${submissionId}`;
    const response = await fetch(apiUrl, {
      headers: {
        "X-Auth-Token": process.env.FORM_SUBMISSION_API_TOKEN!,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      agreementLogger.logError(
        "AGREEMENT_GET_API_ERROR",
        `API error: ${response.status}`,
        {
          userEmail,
          submissionId,
          responseData: errorText,
          apiCalls: [
            {
              url: apiUrl,
              method: "GET",
              status: response.status,
              response: errorText,
              duration: Date.now() - apiStart,
            },
          ],
          duration: Date.now() - startTime,
        },
      );

      return NextResponse.json(
        { error: `Failed to fetch submission details: ${response.status}` },
        { status: 500 },
      );
    }

    const data = await response.json();

    agreementLogger.logInfo("AGREEMENT_GET_SUCCESS", {
      userEmail,
      submissionId,
      responseData: data,
      apiCalls: [
        {
          url: apiUrl,
          method: "GET",
          status: response.status,
          response: data,
          duration: Date.now() - apiStart,
        },
      ],
      duration: Date.now() - startTime,
    });

    // Filter sensitive data for security
    const filteredData = {
      id: data.id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      status: data.status,
      completed_at: data.completed_at,
      audit_log_url: data.audit_log_url,
      combined_document_url: data.combined_document_url,
      template: data.template,
      created_by_user: data.created_by_user,
      // Include documents at same level as submitters
      documents: data.documents || [],
      // Filter submitters to only include slug for current user
      submitters:
        data.submitters?.map((submitter: any) => ({
          id: submitter.id,
          email: submitter.email,
          status: submitter.status,
          completed_at: submitter.completed_at,
          role: submitter.role,
          // Only include slug for current user, remove for others
          ...(submitter.email === userEmail ? { slug: submitter.slug } : {}),
          // Remove sensitive fields: uuid, name for all users
        })) || [],
    };

    // Return the filtered data
    return NextResponse.json(filteredData);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";

    agreementLogger.logError("AGREEMENT_GET_EXCEPTION", errorMessage, {
      userEmail,
      submissionId,
      duration: Date.now() - startTime,
    });

    return NextResponse.json(
      { error: "Failed to fetch submission details", message: errorMessage },
      { status: 500 },
    );
  }
}
