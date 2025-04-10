import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Lấy thông số từ URL
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get("email");
  const templateId = searchParams.get("templateId") || "2";
  
  // Kiểm tra xác thực người dùng hiện tại
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  // Kiểm tra xem email yêu cầu có phải là email của người dùng hiện tại không
  if (email !== session.user.email) {
    return NextResponse.json(
      { error: "Access denied" },
      { status: 403 }
    );
  }
  
  try {
    // Tạo URL với query parameters
    const url = new URL("https://docs.360digital.fm/api/submissions");
    url.searchParams.append("template_id", templateId);
    url.searchParams.append("emails", email);
    url.searchParams.append("q", email); 
    url.searchParams.append("limit", "100");
    
    // Gọi API bên ngoài với token được bảo vệ ở server
    const response = await fetch(url.toString(), {
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
    
    // Trả về dữ liệu cho client
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching licenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch licenses" },
      { status: 500 }
    );
  }
}