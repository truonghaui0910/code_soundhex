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
    artists?: Array<{ 
        id?: string;
        name: string; 
        genres?: string[] 
    }>;
    album_data?: {
        id?: string;
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
            console.error("AUTH_ERROR:", authError);
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const { tracks } = await request.json();

        if (!tracks || !Array.isArray(tracks)) {
            console.error("INVALID_TRACKS_DATA:", { tracks });
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
                console.error(`TRACK_IMPORT_FAILED:`, {
                    trackName: track.name,
                    trackId: track.id,
                    error: error instanceof Error ? error.message : "Unknown error",
                    stack: error instanceof Error ? error.stack : undefined
                });
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
        console.error("IMPORT_MUSIC_ERROR:", error);
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
    let genreId: number | null = null;
    if (genreNames.length > 0) {
        const genreName = genreNames[0];
        if (genreName) {
            let genre = await getOrCreateGenre(supabase, genreName);
            if (genre) {
                genreId = genre.id;
            }
        }
    }

    // 2. Create or get artist
    const artistSpotifyId = trackData.artists?.[0]?.id;

    let artist;
    if (artistSpotifyId && !artistSpotifyId.startsWith('artist_')) {
        // Use real Spotify ID if available and not generated
        artist = await getOrCreateArtist(supabase, {
            name: trackData.artist,
            spotify_id: artistSpotifyId,
            profile_image_url: trackData.image,
            user_id: userId,
        });
    } else {
        // Only create generated ID as fallback for single track imports
        artist = await getOrCreateArtist(supabase, {
            name: trackData.artist,
            spotify_id: `generated_artist_${trackData.id}`,
            profile_image_url: trackData.image,
            user_id: userId,
        });
    }

    // 3. Create or get album
    const albumSpotifyId = trackData.album_data?.id;

    let album;
    if (albumSpotifyId && !albumSpotifyId.startsWith('album_')) {
        // Use real Spotify ID if available and not generated
        album = await getOrCreateAlbum(supabase, {
            title: trackData.album,
            spotify_id: albumSpotifyId,
            artist_id: artist.id,
            cover_image_url: trackData.image,
            release_date: trackData.album_data?.release_date || null,
            description: trackData.album_data?.description || null,
            user_id: userId,
        });
    } else {
        // Only create generated ID as fallback for single track imports
        album = await getOrCreateAlbum(supabase, {
            title: trackData.album,
            spotify_id: `generated_album_${trackData.id}`,
            artist_id: artist.id,
            cover_image_url: trackData.image,
            release_date: trackData.album_data?.release_date || null,
            description: trackData.album_data?.description || null,
            user_id: userId,
        });
    }

    // 4. Create track
    const { data: existingTrack } = await supabase
        .from("tracks")
        .select("id")
        .eq("spotify_id", trackData.id)
        .single();

    if (existingTrack) {
        throw new Error("Track already exists");
    }

    const trackInsertData = {
        title: trackData.name,
        description: null,
        duration: Math.round(trackData.duration),
        file_url: trackData.preview_url || null,
        artist_id: artist.id,
        album_id: album.id,
        genre_id: genreId,
        source_type: "spotify",
        spotify_id: trackData.id,
        preview_url: trackData.preview_url || null,
        popularity: 0,
        isrc: trackData.isrc || null,
        user_id: userId,
    };

    const { data: newTrack, error: trackError } = await supabase
        .from("tracks")
        .insert(trackInsertData)
        .select()
        .single();

    if (trackError) {
        console.error("TRACK_INSERT_ERROR:", trackError);
        throw new Error(`Failed to create track: ${trackError.message}`);
    }
    return newTrack;
}

async function getOrCreateGenre(supabase: any, genreName: string) {
    // First, try to find existing genre
    const { data: existingGenre, error: findError } = await supabase
        .from("genres")
        .select("id, name")
        .ilike("name", genreName)
        .single();

    if (findError && findError.code !== "PGRST116") {
        console.error("Error finding genre:", findError);
        return null;
    }

    if (existingGenre) {
        return existingGenre;
    }

    // Create new genre if not found
    const { data: newGenre, error: createError } = await supabase
        .from("genres")
        .insert({ name: genreName })
        .select("id, name")
        .single();

    if (createError) {
        console.error("Error creating genre:", createError);
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
    const { data: existingArtist, error: selectError } = await supabase
        .from("artists")
        .select("*")
        .eq("spotify_id", artistData.spotify_id)
        .single();

    if (selectError && selectError.code !== 'PGRST116') {
        console.error("ARTIST_SELECT_ERROR:", selectError);
        throw new Error(`Failed to query artist: ${selectError.message}`);
    }

    if (existingArtist) {
        return existingArtist;
    }

    // Create new artist
    const insertData = {
        name: artistData.name,
        spotify_id: artistData.spotify_id,
        profile_image_url: artistData.profile_image_url || null,
        bio: null,
        user_id: artistData.user_id,
    };

    const { data: newArtist, error } = await supabase
        .from("artists")
        .insert(insertData)
        .select()
        .single();

    if (error) {
        console.error("ARTIST_INSERT_ERROR:", error);
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
    const { data: existingAlbum, error: selectError } = await supabase
        .from("albums")
        .select("*")
        .eq("spotify_id", albumData.spotify_id)
        .single();

    if (selectError && selectError.code !== 'PGRST116') {
        console.error("ALBUM_SELECT_ERROR:", selectError);
        throw new Error(`Failed to query album: ${selectError.message}`);
    }

    if (existingAlbum) {
        return existingAlbum;
    }

    // Create new album
    const insertData = {
        title: albumData.title,
        spotify_id: albumData.spotify_id,
        artist_id: albumData.artist_id,
        cover_image_url: albumData.cover_image_url || null,
        release_date: albumData.release_date || null,
        description: albumData.description || null,
        user_id: albumData.user_id,
    };

    const { data: newAlbum, error } = await supabase
        .from("albums")
        .insert(insertData)
        .select()
        .single();

    if (error) {
        console.error("ALBUM_INSERT_ERROR:", error);
        throw new Error(`Failed to create album: ${error.message}`);
    }
    return newAlbum;
}