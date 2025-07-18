// app/api/albums/[id]/tracks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { TracksController } from "@/lib/controllers/tracks";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const albumId = Number(params.id);

    if (!albumId || isNaN(albumId)) {
      return NextResponse.json({ error: "Invalid album ID" }, { status: 400 });
    }

    console.log(`API: Starting tracks fetch for album ${albumId}`);
    const startTime = Date.now();

    const tracks = await TracksController.getTracksByAlbum(albumId);

    const fetchTime = Date.now() - startTime;
    console.log(`API: Tracks fetch completed in ${fetchTime}ms - Count: ${tracks.length}`);

    return NextResponse.json(tracks, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error(`API: Error fetching album ${params.id} tracks:`, error);
    return NextResponse.json(
      { error: "Failed to fetch tracks" },
      { status: 500 },
    );
  }
}
