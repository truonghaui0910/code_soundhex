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
import { NextResponse } from "next/server";
import { AlbumsController } from "@/lib/controllers/albums";

export async function GET() {
  try {
    console.log("API: Starting albums fetch");
    const startTime = Date.now();

    const albums = await AlbumsController.getAllAlbums();

    const fetchTime = Date.now() - startTime;
    console.log(`API: Albums fetch completed in ${fetchTime}ms`);

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
