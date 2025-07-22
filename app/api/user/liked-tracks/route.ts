
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

    // Get liked tracks
    const { data: likedTracks, error } = await supabase
      .from("user_track_likes")
      .select(`
        track_id,
        created_at,
        tracks!inner(
          id,
          title,
          duration,
          file_url,
          custom_url,
          view_count,
          artist:artist_id(
            id,
            name,
            profile_image_url,
            custom_url
          ),
          album:album_id(
            id,
            title,
            cover_image_url,
            custom_url
          )
        )
      `)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching liked tracks:", error);
      return NextResponse.json({ error: "Failed to fetch liked tracks" }, { status: 500 });
    }

    // Transform the data
    const transformedTracks = (likedTracks || []).map(item => ({
      id: item.tracks.id,
      title: item.tracks.title,
      duration: item.tracks.duration,
      file_url: item.tracks.file_url,
      custom_url: item.tracks.custom_url,
      view_count: item.tracks.view_count,
      artist: item.tracks.artist,
      album: item.tracks.album
    }));

    return NextResponse.json(transformedTracks);
  } catch (error) {
    console.error("Error in liked tracks API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
