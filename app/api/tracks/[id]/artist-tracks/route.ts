import { NextRequest, NextResponse } from "next/server";
import { TracksController } from "@/lib/controllers/tracks";

export async function GET(
    request: Request,
    { params }: { params: { id: string } },
) {
    try {
        const trackId = parseInt(params.id);
        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get("limit") || "20");

        console.log(`🎵 API artist-tracks - Starting:`, {
            trackId,
            limit,
            trackIdType: typeof trackId,
            isValidTrackId: !isNaN(trackId) && trackId > 0
        });

        if (isNaN(trackId) || trackId <= 0) {
            console.error("🎵 API artist-tracks - Invalid track ID:", trackId);
            return NextResponse.json(
                { error: "Invalid track ID" },
                { status: 400 },
            );
        }

        const tracks = await TracksController.getTracksByArtistFromTrack(trackId, limit);

        console.log(`🎵 API artist-tracks - Result:`, {
            trackId,
            tracksCount: tracks?.length || 0,
            tracksFound: tracks?.length > 0,
            firstTrackSample: tracks?.[0] ? {
                id: tracks[0].id,
                title: tracks[0].title,
                artistName: tracks[0].artist?.name
            } : null
        });

        return NextResponse.json(tracks);
    } catch (error) {
        console.error("🎵 API artist-tracks - Error:", {
            trackId: params.id,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json(
            { error: "Failed to fetch artist tracks" },
            { status: 500 },
        );
    }
}