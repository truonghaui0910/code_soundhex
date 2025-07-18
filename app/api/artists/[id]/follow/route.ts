import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const artistId = parseInt(params.id);
    if (isNaN(artistId)) {
      return NextResponse.json({ error: "Invalid artist ID" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if already following
    const { data: existingFollow } = await supabase
      .from("user_artist_follows")
      .select("id")
      .eq("user_id", user.id)
      .eq("artist_id", artistId)
      .single();

    if (existingFollow) {
      // Unfollow - remove the follow
      const { error: deleteError } = await supabase
        .from("user_artist_follows")
        .delete()
        .eq("user_id", user.id)
        .eq("artist_id", artistId);

      if (deleteError) {
        console.error("Error unfollowing artist:", deleteError);
        return NextResponse.json({ error: "Failed to unfollow artist" }, { status: 500 });
      }

      return NextResponse.json({ following: false, message: "Artist unfollowed successfully" });
    } else {
      // Follow - add the follow
      const { error: insertError } = await supabase
        .from("user_artist_follows")
        .insert({
          user_id: user.id,
          artist_id: artistId,
        });

      if (insertError) {
        console.error("Error following artist:", insertError);
        return NextResponse.json({ error: "Failed to follow artist" }, { status: 500 });
      }

      return NextResponse.json({ following: true, message: "Artist followed successfully" });
    }
  } catch (error) {
    console.error("Error in artist follow endpoint:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const artistId = parseInt(params.id);
    if (isNaN(artistId)) {
      return NextResponse.json({ error: "Invalid artist ID" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get total followers count
    const { count: totalFollowers } = await supabase
      .from("user_artist_follows")
      .select("*", { count: "exact", head: true })
      .eq("artist_id", artistId);

    // Check if current user follows this artist
    let isFollowing = false;
    if (user) {
      const { data: userFollow } = await supabase
        .from("user_artist_follows")
        .select("id")
        .eq("user_id", user.id)
        .eq("artist_id", artistId)
        .single();

      isFollowing = !!userFollow;
    }

    return NextResponse.json({
      artistId,
      totalFollowers: totalFollowers || 0,
      isFollowing,
    });
  } catch (error) {
    console.error("Error getting artist follow status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}