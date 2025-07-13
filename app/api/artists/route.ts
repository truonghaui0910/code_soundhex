// app/api/artists/route.ts
import { NextResponse } from "next/server";
import { ArtistsController } from "@/lib/controllers/artists";

export async function GET() {
  try {
    console.log("API: Starting artists fetch");
    const startTime = Date.now();

    const artists = await ArtistsController.getAllArtists();

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