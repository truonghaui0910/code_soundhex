
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

interface ImportTrack {
    id: string;
    name: string;
    artist: string;
    album: string;
    duration: number;
    image: string;
    isrc?: string | null;
    preview_url?: string;
    artists?: Array<{ name: string; genres?: string[] }>;
    album_data?: {
        release_date?: string;
        description?: string;
    };
}

export async function POST(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient<Database>({ cookies });

        // Check authentication
        const {
            data: { session },
            error: authError,
        } = await supabase.auth.getSession();

        if (authError || !session) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const { tracks } = await request.json();

        if (!tracks || !Array.isArray(tracks)) {
            return NextResponse.json(
                { error: "Invalid tracks data" },
                { status: 400 }
            );
        }

        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[],
        };

        for (const track of tracks) {
            try {
                await importSingleTrack(supabase, track, session.user.id);
                results.success++;
            } catch (error) {
                console.error(`Failed to import track ${track.name}:`, error);
                results.failed++;
                results.errors.push(
                    `Failed to import "${track.name}": ${
                        error instanceof Error ? error.message : "Unknown error"
                    }`
                );
            }
        }

        return NextResponse.json({
            message: `Import completed. ${results.success} tracks imported successfully, ${results.failed} failed.`,
            results,
        });
    } catch (error) {
        console.error("Import error:", error);
        return NextResponse.json(
            { error: "Failed to import tracks" },
            { status: 500 }
        );
    }
}

async function importSingleTrack(
    supabase: any,
    trackData: ImportTrack,
    userId: string
) {
    // Extract genre from artist data if available
    const genreNames = trackData.artists?.[0]?.genres || [];
    
    // 1. Create or get genres
    const genreIds: number[] = [];
    for (const genreName of genreNames) {
        if (genreName) {
            let genre = await getOrCreateGenre(supabase, genreName);
            if (genre) {
                genreIds.push(genre.id);
            }
        }
    }

    // 2. Create or get artist
    const artist = await getOrCreateArtist(supabase, {
        name: trackData.artist,
        spotify_id: `artist_${trackData.id}`,
        profile_image_url: trackData.image,
        user_id: userId,
    });

    // 3. Create or get album
    const album = await getOrCreateAlbum(supabase, {
        title: trackData.album,
        spotify_id: `album_${trackData.id}`,
        artist_id: artist.id,
        cover_image_url: trackData.image,
        release_date: trackData.album_data?.release_date || null,
        description: trackData.album_data?.description || null,
        user_id: userId,
    });

    // 4. Create track
    const { data: existingTrack } = await supabase
        .from("tracks")
        .select("id")
        .eq("spotify_id", trackData.id)
        .single();

    if (existingTrack) {
        throw new Error("Track already exists");
    }

    const { data: newTrack, error: trackError } = await supabase
        .from("tracks")
        .insert({
            title: trackData.name,
            description: `Imported from Spotify`,
            duration: Math.round(trackData.duration),
            file_url: trackData.preview_url || null,
            artist_id: artist.id,
            album_id: album.id,
            genre_id: genreIds.length > 0 ? genreIds[0] : null,
            source_type: "spotify",
            spotify_id: trackData.id,
            preview_url: trackData.preview_url || null,
            popularity: 0,
            isrc: trackData.isrc || null,
            user_id: userId,
        })
        .select()
        .single();

    if (trackError) {
        throw new Error(`Failed to create track: ${trackError.message}`);
    }

    return newTrack;
}

async function getOrCreateGenre(supabase: any, name: string) {
    // Check if genre exists
    const { data: existingGenre } = await supabase
        .from("genres")
        .select("*")
        .eq("name", name)
        .single();

    if (existingGenre) {
        return existingGenre;
    }

    // Create new genre
    const { data: newGenre, error } = await supabase
        .from("genres")
        .insert({ name })
        .select()
        .single();

    if (error) {
        console.error("Failed to create genre:", error);
        return null;
    }

    return newGenre;
}

async function getOrCreateArtist(
    supabase: any,
    artistData: {
        name: string;
        spotify_id: string;
        profile_image_url?: string;
        user_id: string;
    }
) {
    // Check if artist exists by spotify_id
    const { data: existingArtist } = await supabase
        .from("artists")
        .select("*")
        .eq("spotify_id", artistData.spotify_id)
        .single();

    if (existingArtist) {
        return existingArtist;
    }

    // Create new artist
    const { data: newArtist, error } = await supabase
        .from("artists")
        .insert({
            name: artistData.name,
            spotify_id: artistData.spotify_id,
            profile_image_url: artistData.profile_image_url || null,
            bio: `Artist imported from Spotify`,
            user_id: artistData.user_id,
        })
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create artist: ${error.message}`);
    }

    return newArtist;
}

async function getOrCreateAlbum(
    supabase: any,
    albumData: {
        title: string;
        spotify_id: string;
        artist_id: number;
        cover_image_url?: string;
        release_date?: string | null;
        description?: string | null;
        user_id: string;
    }
) {
    // Check if album exists by spotify_id
    const { data: existingAlbum } = await supabase
        .from("albums")
        .select("*")
        .eq("spotify_id", albumData.spotify_id)
        .single();

    if (existingAlbum) {
        return existingAlbum;
    }

    // Create new album
    const { data: newAlbum, error } = await supabase
        .from("albums")
        .insert({
            title: albumData.title,
            spotify_id: albumData.spotify_id,
            artist_id: albumData.artist_id,
            cover_image_url: albumData.cover_image_url || null,
            release_date: albumData.release_date || null,
            description: albumData.description || null,
            user_id: albumData.user_id,
        })
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create album: ${error.message}`);
    }

    return newAlbum;
}
