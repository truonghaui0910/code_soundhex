
import { NextRequest, NextResponse } from "next/server";
import { ArtistsController } from "@/lib/controllers/artists";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const artistId = parseInt(params.id);
    
    if (isNaN(artistId)) {
      return NextResponse.json(
        { error: "Invalid artist ID" },
        { status: 400 }
      );
    }

    const artist = await ArtistsController.getArtistById(artistId);
    
    if (!artist) {
      return NextResponse.json(
        { error: "Artist not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(artist);
  } catch (error) {
    console.error("Error fetching artist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
