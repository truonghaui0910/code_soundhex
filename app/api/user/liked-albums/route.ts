
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

    // Get liked albums
    const { data: likedAlbums, error } = await supabase
      .from("user_album_likes")
      .select(`
        album_id,
        created_at,
        albums!inner(
          id,
          title,
          cover_image_url,
          release_date,
          artist:artist_id(
            id,
            name
          )
        )
      `)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching liked albums:", error);
      return NextResponse.json({ error: "Failed to fetch liked albums" }, { status: 500 });
    }

    // Transform the data
    const transformedAlbums = (likedAlbums || []).map(item => ({
      id: item.albums.id,
      title: item.albums.title,
      cover_image_url: item.albums.cover_image_url,
      release_date: item.albums.release_date,
      artist: item.albums.artist
    }));

    return NextResponse.json(transformedAlbums);
  } catch (error) {
    console.error("Error in liked albums API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
