// app/api/artists/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ArtistsController } from "@/lib/controllers/artists";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/lib/database.types";

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

      const { artists, total, totalPages } = await ArtistsController.getArtistsWithPagination(
        Number(page),
        Number(limit)
      );

      // Get track counts for each artist
      const artistIds = artists.map(artist => artist.id);
      let trackCountMap = new Map<number, number>();

      if (artistIds.length > 0) {
        const supabase = createServerComponentClient<Database>({ cookies });
        const { data: trackCounts, error: trackCountError } = await supabase
          .from("tracks")
          .select("artist_id")
          .in("artist_id", artistIds);

        if (!trackCountError && trackCounts) {
          // Count tracks per artist
          trackCounts.forEach((track: any) => {
            const count = trackCountMap.get(track.artist_id) || 0;
            trackCountMap.set(track.artist_id, count + 1);
          });
        }
      }

      // Add track counts to artists
      const artistsWithTrackCount = artists.map(artist => ({
        ...artist,
        tracksCount: trackCountMap.get(artist.id) || 0
      }));

      const fetchTime = Date.now() - startTime;
      console.log(`API: Artists fetch completed in ${fetchTime}ms - Count: ${artists.length}`);

      return NextResponse.json(
        {
          artists: artistsWithTrackCount,
          total,
          totalPages,
          currentPage: Number(page)
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"
          }
        }
      );
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