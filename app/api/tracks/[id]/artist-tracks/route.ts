
import { NextRequest, NextResponse } from "next/server";
import { TracksController } from "@/lib/controllers/tracks";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const trackId = parseInt(params.id);
    
    if (!trackId || isNaN(trackId)) {
      return NextResponse.json(
        { error: "Invalid track ID" },
        { status: 400 }
      );
    }

    const tracks = await TracksController.getTracksByArtistFromTrack(trackId);
    
    return NextResponse.json({ tracks }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching artist tracks:", error);
    return NextResponse.json(
      { error: "Failed to fetch artist tracks" },
      { status: 500 }
    );
  }
}
