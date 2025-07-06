
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
      .select("id, created_at")
      .eq("user_id", userId)
      .eq("del_status", 0);

    if (playlistsError) {
      console.error("Error fetching playlists:", playlistsError);
    }

    // Get user albums count
    const { data: albums, error: albumsError } = await supabase
      .from("albums")
      .select("id, created_at")
      .eq("user_id", userId);

    if (albumsError) {
      console.error("Error fetching albums:", albumsError);
    }

    // Get user tracks count
    const { data: tracks, error: tracksError } = await supabase
      .from("tracks")
      .select("id, created_at")
      .eq("user_id", userId);

    if (tracksError) {
      console.error("Error fetching tracks:", tracksError);
    }

    // Calculate growth stats (this month/week)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    const playlistsThisMonth = playlists?.filter(p => new Date(p.created_at) >= startOfMonth).length || 0;
    const albumsThisWeek = albums?.filter(a => new Date(a.created_at) >= startOfWeek).length || 0;
    const tracksThisWeek = tracks?.filter(t => new Date(t.created_at) >= startOfWeek).length || 0;

    const stats = {
      totalPlaylists: playlists?.length || 0,
      totalAlbums: albums?.length || 0,
      totalTracks: tracks?.length || 0,
      playlistsThisMonth,
      albumsThisWeek,
      tracksThisWeek
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching library stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
