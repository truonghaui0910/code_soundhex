// app/api/albums/[id]/tracks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { TracksController } from "@/lib/controllers/tracks";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const albumId = parseInt(params.id);
    if (isNaN(albumId)) {
      return NextResponse.json(
        { error: "Invalid album ID" },
        { status: 400 }
      );
    }

    console.log(`🎵 API: Starting tracks fetch for album ${albumId}`);
    const tracks = await TracksController.getTracksByAlbum(albumId);
    console.log(`🎵 API: Album tracks fetch completed - Count:`, tracks.length);
    console.log(`🎵 API: Sample track view_count:`, tracks[0]?.view_count);

    return NextResponse.json(tracks);
  } catch (error) {
    console.error("Error fetching album tracks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracks" },
      { status: 500 }
    );
  }
}