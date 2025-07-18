
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const trackId = parseInt(params.id);
    if (isNaN(trackId)) {
      return NextResponse.json({ error: "Invalid track ID" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if already liked
    const { data: existingLike } = await supabase
      .from("user_track_likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("track_id", trackId)
      .single();

    if (existingLike) {
      // Unlike - remove the like
      const { error: deleteError } = await supabase
        .from("user_track_likes")
        .delete()
        .eq("user_id", user.id)
        .eq("track_id", trackId);

      if (deleteError) {
        console.error("Error unliking track:", deleteError);
        return NextResponse.json({ error: "Failed to unlike track" }, { status: 500 });
      }

      return NextResponse.json({ liked: false, message: "Track unliked successfully" });
    } else {
      // Like - add the like
      const { error: insertError } = await supabase
        .from("user_track_likes")
        .insert({
          user_id: user.id,
          track_id: trackId,
        });

      if (insertError) {
        console.error("Error liking track:", insertError);
        return NextResponse.json({ error: "Failed to like track" }, { status: 500 });
      }

      return NextResponse.json({ liked: true, message: "Track liked successfully" });
    }
  } catch (error) {
    console.error("Error in track like endpoint:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const trackId = parseInt(params.id);
    if (isNaN(trackId)) {
      return NextResponse.json({ error: "Invalid track ID" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get total likes count
    const { count: totalLikes } = await supabase
      .from("user_track_likes")
      .select("*", { count: "exact", head: true })
      .eq("track_id", trackId);

    // Check if current user liked this track
    let isLiked = false;
    if (user) {
      const { data: userLike } = await supabase
        .from("user_track_likes")
        .select("id")
        .eq("user_id", user.id)
        .eq("track_id", trackId)
        .single();

      isLiked = !!userLike;
    }

    return NextResponse.json({
      trackId,
      totalLikes: totalLikes || 0,
      isLiked,
    });
  } catch (error) {
    console.error("Error getting track like status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
