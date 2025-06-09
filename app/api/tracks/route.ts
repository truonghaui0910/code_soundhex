import { NextResponse } from "next/server";
import { TracksController } from "@/lib/controllers/tracks";
import { NextRequest } from "next/server";

// Declare this route as dynamic since it uses search params
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Use request.nextUrl.searchParams instead of new URL(request.url)
    const { searchParams } = request.nextUrl;
    const albumId = searchParams.get("albumId");
    const artistId = searchParams.get("artistId");

    if (albumId) {
      const tracks = await TracksController.getTracksByAlbum(Number(albumId));
      return NextResponse.json(tracks);
    }

    if (artistId) {
      const tracks = await TracksController.getTracksByArtist(Number(artistId));
      return NextResponse.json(tracks);
    }

    const tracks = await TracksController.getAllTracks();
    return NextResponse.json(tracks);
  } catch (error) {
    console.error("Error fetching tracks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracks" },
      { status: 500 },
    );
  }
}
