// app/api/agreements/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

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
    
    // Parse the JSON body
    const body: SaveAgreementRequest = await request.json();
    
    // Validate data
    if (!body.selectedRights || body.selectedRights.length === 0) {
      return NextResponse.json(
        { error: "At least one right must be selected" },
        { status: 400 }
      );
    }
    
    // Step 1: Call the first API to get the submission_id
    const submissionResponse = await fetch('https://docs.360digital.fm/api/submissions/emails', {
      method: 'POST',
      headers: {
        'X-Auth-Token': 'qh3zTkMnTUNxCvbwSxZx99fuUoLG45fmeK6ZUYUYdKC',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        template_id: 3,
        emails: userEmail
      })
    });
    
    if (!submissionResponse.ok) {
      console.error('Submission API error:', await submissionResponse.text());
      return NextResponse.json(
        { error: `Failed to create submission: ${submissionResponse.status}` },
        { status: 500 }
      );
    }
    
    const submissionData = await submissionResponse.json();
    console.log('Submission data:', submissionData);
    
    if (!submissionData || !submissionData[0] || !submissionData[0].submission_id) {
      return NextResponse.json(
        { error: "Invalid submission data received" },
        { status: 500 }
      );
    }
    
    const submissionId = submissionData[0].submission_id;
    
    // Step 2: Prepare the values for the PATCH request
    const values: { [key: string]: string | boolean } = {};
    
    // Add checkbox values
    body.selectedRights.forEach(right => {
      if (right.checked) {
        values[right.id] = true;
      }
    });
    
    // Add text field values
    body.formFields.forEach(field => {
      if (field.value.trim()) {
        values[field.id] = field.value;
      }
    });
    
    // Step 3: Call the second API to update the submitter with the values
    const updateResponse = await fetch(`http://178.156.150.2:8083/items/submitters/${submissionId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer Fm70LiZ8WQ_1ExEVCqOxyoEgkwjiQiXs',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: JSON.stringify(values)
      })
    });
    
    if (!updateResponse.ok) {
      console.error('Update API error:', await updateResponse.text());
      return NextResponse.json(
        { error: `Failed to update submission: ${updateResponse.status}` },
        { status: 500 }
      );
    }
    
    const updateData = await updateResponse.json();
    console.log('Update data:', updateData);
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: "Agreement saved successfully",
      data: {
        submissionId,
        values
      }
    });
    
  } catch (err) {
    console.error("Error saving agreement:", err);
    return NextResponse.json(
      { error: "Failed to save agreement", message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}