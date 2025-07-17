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
    
    console.log("API: Starting albums fetch", { limit });
    const startTime = Date.now();

    let albums;
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        albums = await AlbumsController.getAlbumsWithLimit(limitNum);
      } else {
        albums = await AlbumsController.getAllAlbums();
      }
    } else {
      albums = await AlbumsController.getAllAlbums();
    }

    const fetchTime = Date.now() - startTime;
    console.log(`API: Albums fetch completed in ${fetchTime}ms - Count: ${albums.length}`);

    return NextResponse.json(albums, {
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
