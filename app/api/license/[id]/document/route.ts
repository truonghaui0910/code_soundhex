import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  // Kiểm tra xác thực người dùng hiện tại
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  try {
    console.log(`Fetching document URL for license ID: ${id}`);
    
    // Gọi API chi tiết license để lấy combined_document_url
    const response = await fetch(`https://docs.360digital.fm/api/submissions/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Token": "qh3zTkMnTUNxCvbwSxZx99fuUoLG45fmeK6ZUYUYdKC"
      },
    });
    
    if (!response.ok) {
      console.log("Error fetching license data, trying alternative endpoint...");
      // Thử endpoint thay thế
      const altResponse = await fetch(`https://docs.360digital.fm/api/submission/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": "qh3zTkMnTUNxCvbwSxZx99fuUoLG45fmeK6ZUYUYdKC"
        },
      });
      
      if (!altResponse.ok) {
        const errorText = await altResponse.text();
        console.error(`API error (${altResponse.status}): ${errorText}`);
        throw new Error(`API error: ${altResponse.status}`);
      }
      
      const data = await altResponse.json();
      // Lấy dữ liệu từ response
      const licenseData = data.data || data;
      
      // Kiểm tra quyền truy cập
      if (licenseData.submitters && licenseData.submitters.length > 0) {
        const userEmails = licenseData.submitters.map((s: any) => s.email);
        if (!userEmails.includes(session.user.email)) {
          return NextResponse.json(
            { error: "Access denied" },
            { status: 403 }
          );
        }
      }
      
      // Lấy combined_document_url
      const documentUrl = licenseData.combined_document_url;
      
      if (!documentUrl) {
        return NextResponse.json(
          { error: "Document not available" },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ documentUrl });
    }
    
    const data = await response.json();
    // Lấy dữ liệu từ response
    const licenseData = data.data || data;
    
    // Kiểm tra quyền truy cập
    if (licenseData.submitters && licenseData.submitters.length > 0) {
      const userEmails = licenseData.submitters.map((s: any) => s.email);
      if (!userEmails.includes(session.user.email)) {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        );
      }
    }
    
    // Lấy combined_document_url
    const documentUrl = licenseData.combined_document_url;
    
    if (!documentUrl) {
      return NextResponse.json(
        { error: "Document not available" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ documentUrl });
  } catch (error) {
    console.error("Error fetching document URL:", error);
    return NextResponse.json(
      { error: "Failed to fetch document URL" },
      { status: 500 }
    );
  }
}