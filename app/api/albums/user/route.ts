
import { NextResponse } from "next/server";
import { AlbumsController } from "@/lib/controllers/albums";
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

    const albums = await AlbumsController.getUserAlbums(session.user.id);
    return NextResponse.json(albums);
  } catch (error) {
    console.error("Error fetching user albums:", error);
    return NextResponse.json(
      { error: "Failed to fetch user albums" },
      { status: 500 }
    );
  }
}
