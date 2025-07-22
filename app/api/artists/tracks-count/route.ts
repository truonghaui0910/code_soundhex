import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies });

    // Get tracks count for each artist
    const { data, error } = await supabase
      .from("tracks")
      .select("artist_id")
      .not("artist_id", "is", null);

    if (error) {
      console.error("Error fetching tracks count:", error);
      return NextResponse.json(
        { error: "Failed to fetch tracks count" },
        { status: 500 }
      );
    }

    // Count tracks per artist
    const tracksCountMap = new Map<number, number>();
    data?.forEach(track => {
      if (track.artist_id) {
        tracksCountMap.set(track.artist_id, (tracksCountMap.get(track.artist_id) || 0) + 1);
      }
    });

    return NextResponse.json(tracksCountMap);
  } catch (error) {
    console.error("Error in tracks count API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 