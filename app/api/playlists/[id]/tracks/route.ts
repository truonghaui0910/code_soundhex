import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { PlaylistsController } from "@/lib/controllers/playlists";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playlistId = parseInt(params.id);
    if (isNaN(playlistId)) {
      return NextResponse.json({ error: "Invalid playlist ID" }, { status: 400 });
    }

    const tracks = await PlaylistsController.getPlaylistTracks(playlistId);
    return NextResponse.json(tracks);
  } catch (error) {
    console.error("Error fetching playlist tracks:", error);
    return NextResponse.json(
      { error: "Failed to fetch playlist tracks" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const playlistId = parseInt(params.id);
    if (isNaN(playlistId)) {
      return NextResponse.json({ error: "Invalid playlist ID" }, { status: 400 });
    }

    const body = await request.json();
    const { track_id } = body;

    if (!track_id || isNaN(parseInt(track_id))) {
      return NextResponse.json({ error: "Valid track ID is required" }, { status: 400 });
    }

    const playlistTrack = await PlaylistsController.addTrackToPlaylist(
      playlistId,
      parseInt(track_id),
      user.id
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
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const playlistId = parseInt(params.id);
    if (isNaN(playlistId)) {
      return NextResponse.json({ error: "Invalid playlist ID" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get("track_id");

    if (!trackId || isNaN(parseInt(trackId))) {
      return NextResponse.json({ error: "Valid track ID is required" }, { status: 400 });
    }

    await PlaylistsController.removeTrackFromPlaylist(
      playlistId,
      parseInt(trackId),
      user.id
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error removing track from playlist:", error);

    if (error.message === "Playlist not found or access denied") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to remove track from playlist" },
      { status: 500 }
    );
  }
}