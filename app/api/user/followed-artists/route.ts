
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get followed artists
    const { data: followedArtists, error } = await supabase
      .from("user_artist_follows")
      .select(`
        artist_id,
        artists!inner(
          id,
          name,
          profile_image_url
        )
      `)
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Error fetching followed artists:", error);
      return NextResponse.json({ error: "Failed to fetch followed artists" }, { status: 500 });
    }

    // Transform the data
    const transformedArtists = (followedArtists || []).map(item => ({
      id: item.artists.id,
      name: item.artists.name,
      profile_image_url: item.artists.profile_image_url
    }));

    return NextResponse.json(transformedArtists);
  } catch (error) {
    console.error("Error in followed artists API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
