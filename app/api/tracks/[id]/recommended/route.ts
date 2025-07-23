
import { NextRequest, NextResponse } from "next/server";
import { TracksController } from "@/lib/controllers/tracks";

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

    const recommendedTracks = await TracksController.getRecommendedTracks(trackId, 12);
    
    return NextResponse.json({
      success: true,
      tracks: recommendedTracks,
    });
  } catch (error) {
    console.error("Error fetching recommended tracks:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommended tracks" },
      { status: 500 }
    );
  }
}
