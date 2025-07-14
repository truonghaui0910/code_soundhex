import { NextRequest, NextResponse } from "next/server";
import { ArtistsController } from "@/lib/controllers/artists";

export async function POST(request: NextRequest) {
  try {
    const { custom_url, exclude_id } = await request.json();

    if (!custom_url) {
      return NextResponse.json({ error: "Custom URL is required" }, { status: 400 });
    }

    // Validate custom_url format
    if (!/^[a-z0-9_-]+$/.test(custom_url)) {
      return NextResponse.json(
        { available: false, error: "Custom URL can only contain lowercase letters, numbers, hyphens, and underscores" },
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