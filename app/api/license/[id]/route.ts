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
    // Gọi API chi tiết license
    const response = await fetch(`https://docs.360digital.fm/api/submissions/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Token": "qh3zTkMnTUNxCvbwSxZx99fuUoLG45fmeK6ZUYUYdKC"
      },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Kiểm tra quyền truy cập (người dùng chỉ được xem license của mình)
    const licenseSubmitters = data.data?.submitters || [];
    const userEmails = licenseSubmitters.map((submitter: any) => submitter.email);
    
    if (!userEmails.includes(session.user.email)) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }
    
    // Trả về dữ liệu cho client
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching license details:", error);
    return NextResponse.json(
      { error: "Failed to fetch license details" },
      { status: 500 }
    );
  }
}