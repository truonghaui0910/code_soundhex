
import { NextResponse } from "next/server";
import { AlbumsController } from "@/lib/controllers/albums";

export async function GET() {
  try {
    const albums = await AlbumsController.getAllAlbums();
    return NextResponse.json(albums);
  } catch (error) {
    console.error("Error fetching albums:", error);
    return NextResponse.json(
      { error: "Failed to fetch albums" },
      { status: 500 }
    );
  }
}
