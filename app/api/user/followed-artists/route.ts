
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

    // Get followed artists with track count
    const { data: followedArtists, error } = await supabase
      .from("user_artist_follows")
      .select(`
        artist_id,
        artists!inner(
          id,
          name,
          profile_image_url,
          custom_url
        )
      `)
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Error fetching followed artists:", error);
      return NextResponse.json({ error: "Failed to fetch followed artists" }, { status: 500 });
    }

    // Get track counts for each artist
    const artistIds: number[] = [];
    const artistsData: any[] = [];
    
    (followedArtists || []).forEach((item: any) => {
      if (item.artists) {
        artistIds.push(item.artists.id);
        artistsData.push(item.artists);
      }
    });
    
    let trackCountMap = new Map<number, number>();
    
    if (artistIds.length > 0) {
      const { data: trackCounts, error: trackCountError } = await supabase
        .from("tracks")
        .select("artist_id")
        .in("artist_id", artistIds);

      if (trackCountError) {
        console.error("Error fetching track counts:", trackCountError);
      } else {
        // Count tracks per artist
        (trackCounts || []).forEach((track: any) => {
          const count = trackCountMap.get(track.artist_id) || 0;
          trackCountMap.set(track.artist_id, count + 1);
        });
      }
    }

    // Transform the data
    const transformedArtists = artistsData.map(artist => ({
      id: artist.id,
      name: artist.name,
      profile_image_url: artist.profile_image_url,
      custom_url: artist.custom_url,
      tracksCount: trackCountMap.get(artist.id) || 0
    }));

    return NextResponse.json(transformedArtists);
  } catch (error) {
    console.error("Error in followed artists API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
