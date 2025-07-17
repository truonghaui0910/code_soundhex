// import { NextResponse } from "next/server";
// import { AlbumsController } from "@/lib/controllers/albums";

// export async function GET() {
//   try {
//     const albums = await AlbumsController.getAllAlbums();
//     return NextResponse.json(albums);
//   } catch (error) {
//     console.error("Error fetching albums:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch albums" },
//       { status: 500 }
//     );
//   }
// }

// app/api/albums/route.ts
import { NextRequest, NextResponse } from "next/server";
import { AlbumsController } from "@/lib/controllers/albums";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const page = searchParams.get("page");
    
    console.log("API: Starting albums fetch", { limit, page });
    const startTime = Date.now();

    let result;
    if (page) {
      // Server-side pagination
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit || "10");
      
      result = await AlbumsController.getAlbumsWithPagination(pageNum, limitNum);
    } else if (limit) {
      // Legacy limit-based fetch
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        const albums = await AlbumsController.getAlbumsWithLimit(limitNum);
        result = { albums, total: albums.length, totalPages: 1 };
      } else {
        const albums = await AlbumsController.getAllAlbums();
        result = { albums, total: albums.length, totalPages: 1 };
      }
    } else {
      // Get all albums
      const albums = await AlbumsController.getAllAlbums();
      result = { albums, total: albums.length, totalPages: 1 };
    }

    const fetchTime = Date.now() - startTime;
    console.log(`API: Albums fetch completed in ${fetchTime}ms - Count: ${result.albums.length}`);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("API: Error fetching albums:", error);
    return NextResponse.json(
      { error: "Failed to fetch albums" },
      { status: 500 },
    );
  }
}
