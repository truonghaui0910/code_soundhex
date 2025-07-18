
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const albumId = parseInt(params.id);
    if (isNaN(albumId)) {
      return NextResponse.json({ error: "Invalid album ID" }, { status: 400 });
    }

    const supabase = createClient(cookies());
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if already liked
    const { data: existingLike } = await supabase
      .from("user_album_likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("album_id", albumId)
      .single();

    if (existingLike) {
      // Unlike - remove the like
      const { error: deleteError } = await supabase
        .from("user_album_likes")
        .delete()
        .eq("user_id", user.id)
        .eq("album_id", albumId);

      if (deleteError) {
        console.error("Error unliking album:", deleteError);
        return NextResponse.json({ error: "Failed to unlike album" }, { status: 500 });
      }

      return NextResponse.json({ liked: false, message: "Album unliked successfully" });
    } else {
      // Like - add the like
      const { error: insertError } = await supabase
        .from("user_album_likes")
        .insert({
          user_id: user.id,
          album_id: albumId,
        });

      if (insertError) {
        console.error("Error liking album:", insertError);
        return NextResponse.json({ error: "Failed to like album" }, { status: 500 });
      }

      return NextResponse.json({ liked: true, message: "Album liked successfully" });
    }
  } catch (error) {
    console.error("Error in album like endpoint:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const albumId = parseInt(params.id);
    if (isNaN(albumId)) {
      return NextResponse.json({ error: "Invalid album ID" }, { status: 400 });
    }

    const supabase = createClient(cookies());
    const { data: { user } } = await supabase.auth.getUser();

    // Get total likes count
    const { count: totalLikes } = await supabase
      .from("user_album_likes")
      .select("*", { count: "exact", head: true })
      .eq("album_id", albumId);

    // Check if current user liked this album
    let isLiked = false;
    if (user) {
      const { data: userLike } = await supabase
        .from("user_album_likes")
        .select("id")
        .eq("user_id", user.id)
        .eq("album_id", albumId)
        .single();

      isLiked = !!userLike;
    }

    return NextResponse.json({
      albumId,
      totalLikes: totalLikes || 0,
      isLiked,
    });
  } catch (error) {
    console.error("Error getting album like status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
