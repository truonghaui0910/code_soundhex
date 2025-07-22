import { NextRequest, NextResponse } from "next/server";
import { TracksController } from "@/lib/controllers/tracks";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: "Track ID is required" },
        { status: 400 }
      );
    }

    let track = null;

    // First try to get by numeric ID
    if (!isNaN(Number(id))) {
      const trackId = parseInt(id);
      track = await TracksController.getTrackById(trackId);
    }

    // If not found by ID, try by custom_url
    if (!track) {
      track = await TracksController.getTrackByCustomUrl(id);
    }

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
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 