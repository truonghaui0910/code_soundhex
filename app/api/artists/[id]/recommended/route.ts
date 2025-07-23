
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const artistId = parseInt(params.id);
    
    if (isNaN(artistId)) {
      return NextResponse.json(
        { error: "Invalid artist ID" },
        { status: 400 }
      );
    }

    // Get random 12 artists excluding current artist
    const { data: artists, error } = await supabase
      .from("artists")
      .select(`
        id,
        name,
        profile_image_url,
        bio,
        custom_url,
        created_at
      `)
      .neq('id', artistId)
      .order('RANDOM()', { ascending: true })
      .limit(12);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      );
    }

    // Add tracks count for each artist
    const artistsWithCount = await Promise.all(
      (artists || []).map(async (artist) => {
        const { count } = await supabase
          .from("tracks")
          .select("*", { count: "exact", head: true })
          .eq("artist_id", artist.id);
        
        return {
          ...artist,
          tracksCount: count || 0
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      artists: artistsWithCount,
    });
  } catch (error) {
    console.error("Error fetching recommended artists:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommended artists" },
      { status: 500 }
    );
  }
}
