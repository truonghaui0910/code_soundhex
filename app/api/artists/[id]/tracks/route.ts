// app/api/artists/[id]/tracks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { TracksController } from "@/lib/controllers/tracks";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    console.log(`API: Received request for artist ${params.id} tracks`);

    const artistId = Number(params.id);

    if (!artistId || isNaN(artistId)) {
      console.log(`API: Invalid artist ID: ${params.id}`);
      return NextResponse.json(
        {
          error: "Invalid artist ID",
          received: params.id,
        },
        { status: 400 },
      );
    }

    console.log(`API: Starting tracks fetch for artist ${artistId}`);
    const startTime = Date.now();

    const tracks = await TracksController.getTracksByArtist(artistId);

    const fetchTime = Date.now() - startTime;
    console.log(
      `API: Artist tracks fetch completed in ${fetchTime}ms - Count: ${tracks.length}`,
    );

    return NextResponse.json(tracks, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error(`API: Error fetching artist ${params.id} tracks:`, error);
    return NextResponse.json(
      {
        error: "Failed to fetch tracks",
        artistId: params.id,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
