import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { PlaylistsController } from "@/lib/controllers/playlists";
import { TracksController } from "@/lib/controllers/tracks";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { searchParams } = new URL(request.url);
    const playlistId = parseInt(params.id);

    if (isNaN(playlistId)) {
      return NextResponse.json(
        { error: "Invalid playlist ID" },
        { status: 400 },
      );
    }

    const supabase = createServerComponentClient({ cookies });

    // Get playlist tracks with full track information
    const { data: playlistTracks, error } = await supabase
      .from("playlist_tracks")
      .select(
        `
        id,
        playlist_id,
        track_id,
        added_at,
        track:track_id (
          id,
          title,
          description,
          duration,
          file_url,
          source_type,
          created_at,
          artist_id,
          album_id,
          genre_id
        )
      `,
      )
      .eq("playlist_id", playlistId)
      .order("added_at", { ascending: false });

    if (error) {
      console.error("Error fetching playlist tracks:", error);
      return NextResponse.json(
        { error: "Failed to fetch playlist tracks" },
        { status: 500 },
      );
    }

    if (!playlistTracks || playlistTracks.length === 0) {
      return NextResponse.json([]);
    }

    // Get track IDs to fetch complete information
    const trackIds = playlistTracks.map((pt) => pt.track_id);

    // Use TracksController to get complete track information
    const tracks = await TracksController.getTracksByIds(trackIds);

    // Map tracks to playlist tracks structure
    const trackMap = new Map(tracks.map((track) => [track.id, track]));

    const completePlaylistTracks = playlistTracks.map((pt) => ({
      id: pt.id,
      playlist_id: pt.playlist_id,
      track_id: pt.track_id,
      added_at: pt.added_at,
      track: trackMap.get(pt.track_id) || pt.track,
    }));

    return NextResponse.json(completePlaylistTracks);
  } catch (error) {
    console.error("Error in playlist tracks API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const playlistId = parseInt(params.id);
    if (isNaN(playlistId)) {
      return NextResponse.json(
        { error: "Invalid playlist ID" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { track_id } = body;

    if (!track_id || isNaN(parseInt(track_id))) {
      return NextResponse.json(
        { error: "Valid track ID is required" },
        { status: 400 },
      );
    }

    const playlistTrack = await PlaylistsController.addTrackToPlaylist(
      playlistId,
      parseInt(track_id),
      user.id,
    );

    return NextResponse.json(playlistTrack, { status: 201 });
  } catch (error: any) {
    console.error("Error adding track to playlist:", error);

    if (error.message === "Playlist not found or access denied") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error.message === "Track already exists in playlist") {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Failed to add track to playlist" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const playlistId = parseInt(params.id);
    if (isNaN(playlistId)) {
      return NextResponse.json(
        { error: "Invalid playlist ID" },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get("track_id");

    if (!trackId || isNaN(parseInt(trackId))) {
      return NextResponse.json(
        { error: "Valid track ID is required" },
        { status: 400 },
      );
    }

    await PlaylistsController.removeTrackFromPlaylist(
      playlistId,
      parseInt(trackId),
      user.id,
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error removing track from playlist:", error);

    if (error.message === "Playlist not found or access denied") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to remove track from playlist" },
      { status: 500 },
    );
  }
}
