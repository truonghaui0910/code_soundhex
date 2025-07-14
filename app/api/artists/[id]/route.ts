
import { NextRequest, NextResponse } from "next/server";
import { ArtistsController } from "@/lib/controllers/artists";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const artistId = parseInt(params.id);
    
    if (isNaN(artistId)) {
      return NextResponse.json(
        { error: "Invalid artist ID" },
        { status: 400 }
      );
    }

    const artist = await ArtistsController.getArtistById(artistId);
    
    if (!artist) {
      return NextResponse.json(
        { error: "Artist not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(artist);
  } catch (error) {
    console.error("Error fetching artist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const artistId = parseInt(params.id);
    const body = await request.json();
    const { custom_url, social, bio } = body;

    // Validate custom_url format
    if (custom_url && !/^[a-z0-9_-]+$/.test(custom_url)) {
      return NextResponse.json(
        { error: "Custom URL can only contain lowercase letters, numbers, hyphens, and underscores" },
        { status: 400 }
      );
    }

    // Check if custom_url is available
    if (custom_url) {
      const isAvailable = await ArtistsController.checkCustomUrlAvailable(custom_url, artistId);
      if (!isAvailable) {
        return NextResponse.json(
          { error: "This custom URL is already taken" },
          { status: 400 }
        );
      }
    }

    // Get current artist to verify ownership
    const currentArtist = await ArtistsController.getArtistById(artistId);
    if (!currentArtist) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    if (currentArtist.user_id !== user.id) {
      return NextResponse.json({ error: "You don't own this artist" }, { status: 403 });
    }

    // Update artist
    const updatedArtist = await ArtistsController.updateArtist(artistId, {
      custom_url,
      social: social && social.length > 0 ? JSON.stringify(social) : null,
      bio
    });

    return NextResponse.json(updatedArtist);
  } catch (error) {
    console.error("Error updating artist:", error);
    return NextResponse.json(
      { 
        error: "Failed to update artist",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
