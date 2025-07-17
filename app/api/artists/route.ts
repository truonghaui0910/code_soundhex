// app/api/artists/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ArtistsController } from "@/lib/controllers/artists";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    
    console.log("API: Starting artists fetch", { limit });
    const startTime = Date.now();

    let artists;
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        artists = await ArtistsController.getArtistsWithLimit(limitNum);
      } else {
        artists = await ArtistsController.getAllArtists();
      }
    } else {
      artists = await ArtistsController.getAllArtists();
    }

    const fetchTime = Date.now() - startTime;
    console.log(`API: Artists fetch completed in ${fetchTime}ms - Count: ${artists.length}`);

    return NextResponse.json(artists, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    console.error("API: Error fetching artists:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch artists",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}