
import { NextResponse } from "next/server";
import { ArtistsController } from "@/lib/controllers/artists";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const artists = await ArtistsController.getUserArtists(session.user.id);
    return NextResponse.json(artists);
  } catch (error) {
    console.error("Error fetching user artists:", error);
    return NextResponse.json(
      { error: "Failed to fetch user artists" },
      { status: 500 }
    );
  }
}
