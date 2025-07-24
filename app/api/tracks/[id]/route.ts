import { NextRequest, NextResponse } from "next/server";
import { TracksController } from "@/lib/controllers/tracks";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const trackId = parseInt(params.id);
    if (isNaN(trackId)) {
      return NextResponse.json(
        { error: "Invalid track ID" },
        { status: 400 }
      );
    }

    const track = await TracksController.getTrackById(trackId);

    if (!track) {
      return NextResponse.json(
        { error: "Track not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(track);
  } catch (error) {
    console.error("Error fetching track:", error);
    return NextResponse.json(
      { error: "Failed to fetch track" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const trackId = parseInt(params.id);
    if (isNaN(trackId)) {
      return NextResponse.json(
        { error: "Invalid track ID" },
        { status: 400 }
      );
    }

    const supabase = createServerComponentClient({ cookies });

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if track exists and user owns it
    const { data: track, error: trackError } = await supabase
      .from("tracks")
      .select("*, artist:artists!inner(*)")
      .eq("id", trackId)
      .single();

    if (trackError || !track) {
      return NextResponse.json(
        { error: "Track not found" },
        { status: 404 }
      );
    }

    // Check if user owns this track (via artist)
    if (track.artist.user_id !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to edit this track" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { custom_url, mood } = body;

    const updateData: any = {};

    if (custom_url !== undefined) {
      updateData.custom_url = custom_url || null;
    }

    if (mood !== undefined) {
      updateData.mood = Array.isArray(mood) ? mood : [];
    }

    console.log("PATCH Track - Update data:", updateData);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Update track
    const { data: updatedTrack, error: updateError } = await supabase
      .from("tracks")
      .update(updateData)
      .eq("id", trackId)
      .select(`
        *, 
        artist:artists!inner(id, name, profile_image_url, custom_url),
        album:albums(id, title, cover_image_url, custom_url),
        genre:genres(id, name)
      `)
      .single();

    if (updateError) {
      console.error("Error updating track:", updateError);
      return NextResponse.json(
        { error: "Failed to update track" },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedTrack);
  } catch (error) {
    console.error("Error updating track:", error);
    return NextResponse.json(
      { error: "Failed to update track" },
      { status: 500 }
    );
  }
}