import { NextRequest, NextResponse } from "next/server";
import { TracksController } from "@/lib/controllers/tracks";

// Declare this route as dynamic since it uses search params
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');
    const albumId = searchParams.get("albumId");
    const artistId = searchParams.get("artistId");
    const genre = searchParams.get("genre");
    const limit = searchParams.get("limit");

    // If specific track IDs are requested
    if (ids) {
      const trackIds = ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      if (trackIds.length > 0) {
        const tracks = await TracksController.getTracksByIds(trackIds);
        return NextResponse.json(tracks);
      }
    }

    // If album ID is specified
    if (albumId) {
      const tracks = await TracksController.getTracksByAlbum(Number(albumId));
      return NextResponse.json(tracks);
    }

    // If artist ID is specified
    if (artistId) {
      const tracks = await TracksController.getTracksByArtist(Number(artistId));
      return NextResponse.json(tracks);
    }

    // Default: get all tracks
    let tracks = await TracksController.getAllTracks();
    
    // Filter by genre if specified
    if (genre) {
      tracks = tracks.filter(track => track.genre?.name === genre);
    }
    
    // Apply limit if specified
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        tracks = tracks.slice(0, limitNum);
      }
    }

    return NextResponse.json(tracks);
  } catch (error) {
    console.error("Error fetching tracks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracks" },
      { status: 500 },
    );
  }
}