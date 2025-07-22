import { NextRequest, NextResponse } from "next/server";
import { TracksController } from "@/lib/controllers/tracks";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const idOrCustomUrl = params.id;
    let track;

    // Try to parse as number first (ID)
    const trackId = parseInt(idOrCustomUrl);

    if (!isNaN(trackId)) {
      // It's a valid number, search by ID
      track = await TracksController.getTrackById(trackId);
    } else {
      // It's not a number, search by custom_url
      track = await TracksController.getTrackByCustomUrl(idOrCustomUrl);
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
      { error: "Failed to fetch track" },
      { status: 500 }
    );
  }
}