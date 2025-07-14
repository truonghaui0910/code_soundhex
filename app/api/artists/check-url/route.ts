import { NextRequest, NextResponse } from "next/server";
import { ArtistsController } from "@/lib/controllers/artists";

export async function POST(request: NextRequest) {
  try {
    const { custom_url, exclude_id } = await request.json();

    // Validate custom_url format
    if (!/^[a-z0-9_-]+$/.test(custom_url)) {
      return NextResponse.json(
        { available: false, error: "Invalid format" },
        { status: 400 }
      );
    }

    const isAvailable = await ArtistsController.checkCustomUrlAvailable(custom_url, exclude_id);

    return NextResponse.json({ available: isAvailable });
  } catch (error) {
    console.error("Error checking custom URL:", error);
    return NextResponse.json(
      { error: "Failed to check custom URL availability" },
      { status: 500 }
    );
  }
}