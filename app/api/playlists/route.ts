
import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { PlaylistsController } from "@/lib/controllers/playlists";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const playlists = await PlaylistsController.getUserPlaylists(user.id);
    return NextResponse.json(playlists);
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return NextResponse.json(
      { error: "Failed to fetch playlists" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, cover_image_url, private: isPrivate } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Playlist name is required" },
        { status: 400 }
      );
    }

    // Check for duplicate playlist name for this user
    const existingPlaylists = await PlaylistsController.getUserPlaylists(user.id);
    const duplicatePlaylist = existingPlaylists.find(
      playlist => playlist.name.toLowerCase() === name.trim().toLowerCase()
    );
    
    if (duplicatePlaylist) {
      return NextResponse.json(
        { error: "A playlist with this name already exists" },
        { status: 409 }
      );
    }

    const playlist = await PlaylistsController.createPlaylist(
      user.id,
      name.trim(),
      description,
      cover_image_url,
      isPrivate
    );

    return NextResponse.json(playlist, { status: 201 });
  } catch (error) {
    console.error("Error creating playlist:", error);
    return NextResponse.json(
      { error: "Failed to create playlist" },
      { status: 500 }
    );
  }
}
