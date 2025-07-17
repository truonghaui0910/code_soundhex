// app/api/artists/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ArtistsController } from "@/lib/controllers/artists";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const page = searchParams.get("page");
    
    console.log("API: Starting artists fetch", { limit, page });
    const startTime = Date.now();

    let result;
    if (page) {
      // Server-side pagination
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit || "10");
      
      result = await ArtistsController.getArtistsWithPagination(pageNum, limitNum);
    } else if (limit) {
      // Legacy limit-based fetch
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        const artists = await ArtistsController.getArtistsWithLimit(limitNum);
        result = { artists, total: artists.length, totalPages: 1 };
      } else {
        const artists = await ArtistsController.getAllArtists();
        result = { artists, total: artists.length, totalPages: 1 };
      }
    } else {
      // Get all artists
      const artists = await ArtistsController.getAllArtists();
      result = { artists, total: artists.length, totalPages: 1 };
    }

    const fetchTime = Date.now() - startTime;
    console.log(`API: Artists fetch completed in ${fetchTime}ms - Count: ${result.artists.length}`);

    return NextResponse.json(result, {
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