
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const albumId = parseInt(params.id);
    
    if (isNaN(albumId)) {
      return NextResponse.json(
        { error: "Invalid album ID" },
        { status: 400 }
      );
    }

    // Get random 12 albums excluding current album
    const { data: albums, error } = await supabase
      .from("albums")
      .select(`
        id,
        title,
        cover_image_url,
        release_date,
        custom_url,
        artist:artists!inner (
          id,
          name,
          custom_url
        )
      `)
      .neq('id', albumId)
      .order('RANDOM()', { ascending: true })
      .limit(12);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      albums: albums || [],
    });
  } catch (error) {
    console.error("Error fetching recommended albums:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommended albums" },
      { status: 500 }
    );
  }
}
