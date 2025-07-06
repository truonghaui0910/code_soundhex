
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "@/types/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Get current user
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user playlists count
    const { data: playlists, error: playlistsError } = await supabase
      .from("playlists")
      .select("id")
      .eq("user_id", userId)
      .eq("del_status", 0);

    if (playlistsError) {
      console.error("Error fetching playlists:", playlistsError);
    }

    // Get user albums count
    const { data: albums, error: albumsError } = await supabase
      .from("albums")
      .select("id")
      .eq("user_id", userId);

    if (albumsError) {
      console.error("Error fetching albums:", albumsError);
    }

    // Get user tracks count
    const { data: tracks, error: tracksError } = await supabase
      .from("tracks")
      .select("id")
      .eq("user_id", userId);

    if (tracksError) {
      console.error("Error fetching tracks:", tracksError);
    }

    // Get total plays (assuming we have a plays field or table)
    // For now, we'll use a placeholder since the exact structure isn't clear
    let totalPlays = 0;
    
    // You can uncomment and modify this when you have a plays tracking system
    // const { data: playsData, error: playsError } = await supabase
    //   .from("track_plays")
    //   .select("play_count")
    //   .eq("user_id", userId);
    
    // if (!playsError && playsData) {
    //   totalPlays = playsData.reduce((total, play) => total + (play.play_count || 0), 0);
    // }

    // For now, calculate some mock plays based on tracks count
    totalPlays = (tracks?.length || 0) * Math.floor(Math.random() * 1000) + 500;

    const stats = {
      totalPlaylists: playlists?.length || 0,
      totalAlbums: albums?.length || 0,
      totalTracks: tracks?.length || 0,
      totalPlays: totalPlays,
      // Mock revenue data - replace with real data when available
      monthlyRevenue: 2450,
      dailyRevenue: 185,
      revenueChange: "+12.5%"
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
