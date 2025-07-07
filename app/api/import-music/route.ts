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
            console.error("🔒 AUTH_ERROR:", authError);
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const { tracks } = await request.json();
        console.log("🎵 IMPORT_MUSIC_START:", {
            userEmail: session.user.email,
            tracksCount: tracks?.length || 0
        });

        if (!tracks || !Array.isArray(tracks)) {
            console.error("❌ INVALID_TRACKS_DATA:", { tracks });
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
                console.log("🎯 IMPORTING_TRACK:", {
                    trackId: track.id,
                    trackName: track.name,
                    artist: track.artist,
                    album: track.album
                });

                // Detect import type based on track data structure
                const importType = track.album_data?.id && !track.artists?.[0]?.genres ? 'album' : 'artist';
                
                await importSingleTrack(supabase, track, session.user.id, importType);
                results.success++;

                console.log("✅ TRACK_IMPORTED_SUCCESS:", {
                    trackName: track.name,
                    trackId: track.id
                });
            } catch (error) {
                console.error(`❌ TRACK_IMPORT_FAILED:`, {
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

        console.log("🎵 IMPORT_MUSIC_COMPLETE:", {
            userEmail: session.user.email,
            totalTracks: tracks.length,
            success: results.success,
            failed: results.failed
        });

        return NextResponse.json({
            message: `Import completed. ${results.success} tracks imported successfully, ${results.failed} failed.`,
            results,
        });
    } catch (error) {
        console.error("💥 IMPORT_MUSIC_ERROR:", error);
        return NextResponse.json(
            { error: "Failed to import tracks" },
            { status: 500 }
        );
    }
}

// Cache để lưu genres của artist đã fetch
const artistGenresCache = new Map<string, string[]>();

// Hàm fetch genres từ artist API
async function fetchArtistGenres(artistId: string): Promise<string[]> {
    // Kiểm tra cache trước
    if (artistGenresCache.has(artistId)) {
        console.log("🎭 ARTIST_GENRES_FROM_CACHE:", { artistId, genres: artistGenresCache.get(artistId) });
        return artistGenresCache.get(artistId) || [];
    }

    try {
        console.log("🎭 FETCHING_ARTIST_GENRES:", { artistId });
        const apiUrl = `http://source.automusic.win/spotify/artist-onl/get/${artistId}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            console.error("🎭 ARTIST_GENRES_API_ERROR:", { artistId, status: response.status });
            return [];
        }

        const artistData = await response.json();
        const genres = artistData.genres || [];
        
        // Lưu vào cache
        artistGenresCache.set(artistId, genres);
        console.log("🎭 ARTIST_GENRES_FETCHED:", { artistId, genres });
        
        return genres;
    } catch (error) {
        console.error("🎭 ARTIST_GENRES_FETCH_ERROR:", { artistId, error: error instanceof Error ? error.message : 'Unknown error' });
        return [];
    }
}

// Cache để lưu full artist data
const artistFullDataCache = new Map<string, any>();

// Hàm fetch thông tin artist đầy đủ từ API
async function fetchArtistFullData(artistId: string): Promise<any> {
    // Kiểm tra cache trước
    if (artistFullDataCache.has(artistId)) {
        console.log("🎤 ARTIST_FULL_DATA_FROM_CACHE:", { artistId });
        return artistFullDataCache.get(artistId);
    }

    try {
        console.log("🎤 FETCHING_ARTIST_FULL_DATA:", { artistId });
        const apiUrl = `http://source.automusic.win/spotify/artist-onl/get/${artistId}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            console.error("🎤 ARTIST_FULL_DATA_API_ERROR:", { artistId, status: response.status });
            return null;
        }

        const artistData = await response.json();
        
        // Lưu vào cache
        artistFullDataCache.set(artistId, artistData);
        console.log("🎤 ARTIST_FULL_DATA_FETCHED:", { artistId, name: artistData.name });
        
        return artistData;
    } catch (error) {
        console.error("🎤 ARTIST_FULL_DATA_FETCH_ERROR:", { artistId, error: error instanceof Error ? error.message : 'Unknown error' });
        return null;
    }
}

async function importSingleTrack(
    supabase: any,
    trackData: ImportTrack,
    userId: string,
    importType?: string
) {
    console.log("🔍 IMPORT_SINGLE_TRACK_START:", {
        trackId: trackData.id,
        trackName: trackData.name,
        artistData: trackData.artists,
        albumData: trackData.album_data,
        importType
    });

    // Extract genre from artist data if available (for artist imports)
    let genreNames = trackData.artists?.[0]?.genres || [];
    let artistFullData = null;
    console.log("🎭 GENRES_FROM_TRACK_DATA:", { genreNames, artistData: trackData.artists?.[0] });

    // Nếu chưa có genres và có artist_id thực từ Spotify, fetch từ API
    const artistSpotifyId = trackData.artists?.[0]?.id;
    if (genreNames.length === 0 && artistSpotifyId && !artistSpotifyId.startsWith('generated_') && !artistSpotifyId.startsWith('artist_')) {
        console.log("🎭 FETCHING_GENRES_FOR_ARTIST:", { artistSpotifyId });
        genreNames = await fetchArtistGenres(artistSpotifyId);
        
        // Nếu là album import, cần fetch thông tin artist đầy đủ để tạo artist record
        if (importType === 'album') {
            artistFullData = await fetchArtistFullData(artistSpotifyId);
        }
    }

    // 1. Create or get genres
    let genreId: number | null = null;
    if (genreNames.length > 0) {
        const genreName = genreNames[0];
        if (genreName) {
            let genre = await getOrCreateGenre(supabase, genreName);
            if (genre) {
                genreId = genre.id;
                console.log("🎭 GENRE_PROCESSED:", { genreName, genreId: genre.id });
            }
        }
    }

    // 2. Create or get artist
    console.log("🎤 ARTIST_SPOTIFY_ID:", { artistSpotifyId, artistName: trackData.artist });

    let artist;
    if (artistSpotifyId && !artistSpotifyId.startsWith('generated_') && !artistSpotifyId.startsWith('artist_')) {
        // Use real Spotify ID if available and valid
        const artistImageUrl = importType === 'album' && artistFullData?.images?.[0]?.url 
            ? artistFullData.images[0].url 
            : trackData.image;
            
        artist = await getOrCreateArtist(supabase, {
            name: trackData.artist,
            spotify_id: artistSpotifyId,
            profile_image_url: artistImageUrl,
            user_id: userId,
        });
    } else {
        // Create without spotify_id if no valid Spotify ID available
        artist = await getOrCreateArtist(supabase, {
            name: trackData.artist,
            spotify_id: null, // No Spotify ID
            profile_image_url: trackData.image,
            user_id: userId,
        });
    }
    console.log("🎤 ARTIST_PROCESSED:", { artistId: artist.id, artistSpotifyId });

    // 3. Create or get album
    const albumSpotifyId = trackData.album_data?.id;
    console.log("💿 ALBUM_SPOTIFY_ID:", { albumSpotifyId, albumName: trackData.album });

    let album;
    if (albumSpotifyId && !albumSpotifyId.startsWith('generated_') && !albumSpotifyId.startsWith('album_')) {
        // Use real Spotify ID if available and valid
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
        // Create without spotify_id if no valid Spotify ID available
        album = await getOrCreateAlbum(supabase, {
            title: trackData.album,
            spotify_id: null, // No Spotify ID
            artist_id: artist.id,
            cover_image_url: trackData.image,
            release_date: trackData.album_data?.release_date || null,
            description: trackData.album_data?.description || null,
            user_id: userId,
        });
    }
    console.log("💿 ALBUM_PROCESSED:", { albumId: album.id, albumSpotifyId });

    // 4. Create track
    const { data: existingTrack } = await supabase
        .from("tracks")
        .select("id")
        .eq("spotify_id", trackData.id)
        .single();

    if (existingTrack) {
        console.log("⚠️ TRACK_ALREADY_EXISTS:", { trackId: trackData.id, existingTrackId: existingTrack.id });
        throw new Error("Track already exists");
    }

    const trackInsertData = {
        title: trackData.name,
        description: `Imported from Spotify`,
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

    console.log("🎵 TRACK_INSERT_DATA:", trackInsertData);

    const { data: newTrack, error: trackError } = await supabase
        .from("tracks")
        .insert(trackInsertData)
        .select()
        .single();

    if (trackError) {
        console.error("❌ TRACK_INSERT_ERROR:", trackError);
        throw new Error(`Failed to create track: ${trackError.message}`);
    }

    console.log("✅ TRACK_CREATED:", { trackId: newTrack.id, spotifyId: trackData.id });
    return newTrack;
}

async function getOrCreateGenre(supabase: any, genreName: string) {
    console.log("🎭 GET_OR_CREATE_GENRE:", { genreName });

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
        console.log("🎭 GENRE_FOUND:", { genreId: existingGenre.id, genreName });
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

        // If it's a duplicate key error, try to find the existing genre again
        if (createError.code === '23505') {
            console.log("🎭 DUPLICATE_KEY_ERROR - Retrying find genre:", { genreName });
            const { data: retryGenre, error: retryError } = await supabase
                .from("genres")
                .select("id, name")
                .ilike("name", genreName)
                .single();

            if (!retryError && retryGenre) {
                console.log("🎭 GENRE_FOUND_ON_RETRY:", { genreId: retryGenre.id, genreName });
                return retryGenre;
            }
        }

        return null;
    }

    console.log("🎭 GENRE_CREATED:", { genreId: newGenre.id, genreName });
    return newGenre;
}

async function getOrCreateArtist(
    supabase: any,
    artistData: {
        name: string;
        spotify_id: string | null;
        profile_image_url?: string;
        user_id: string;
    }
) {
    console.log("🎤 GET_OR_CREATE_ARTIST:", {
        name: artistData.name,
        spotify_id: artistData.spotify_id
    });

    // Check if artist exists by spotify_id (only if spotify_id is provided)
    if (artistData.spotify_id) {
        const { data: existingArtist, error: selectError } = await supabase
            .from("artists")
            .select("*")
            .eq("spotify_id", artistData.spotify_id)
            .single();

        if (selectError && selectError.code !== 'PGRST116') {
            console.error("❌ ARTIST_SELECT_ERROR:", selectError);
            throw new Error(`Failed to query artist: ${selectError.message}`);
        }

        if (existingArtist) {
            console.log("🎤 ARTIST_EXISTS:", { 
                artistId: existingArtist.id, 
                name: artistData.name,
                spotify_id: artistData.spotify_id 
            });
            return existingArtist;
        }
    } else {
        // If no spotify_id, check by name and user_id to avoid duplicates
        const { data: existingArtist, error: selectError } = await supabase
            .from("artists")
            .select("*")
            .eq("name", artistData.name)
            .eq("user_id", artistData.user_id)
            .is("spotify_id", null)
            .single();

        if (selectError && selectError.code !== 'PGRST116') {
            console.error("❌ ARTIST_SELECT_ERROR:", selectError);
            throw new Error(`Failed to query artist: ${selectError.message}`);
        }

        if (existingArtist) {
            console.log("🎤 ARTIST_EXISTS_BY_NAME:", { 
                artistId: existingArtist.id, 
                name: artistData.name
            });
            return existingArtist;
        }
    }

    // Create new artist
    const insertData = {
        name: artistData.name,
        spotify_id: artistData.spotify_id,
        profile_image_url: artistData.profile_image_url || null,
        bio: `Artist imported from Spotify`,
        user_id: artistData.user_id,
    };

    console.log("🎤 ARTIST_INSERT_DATA:", insertData);

    const { data: newArtist, error } = await supabase
        .from("artists")
        .insert(insertData)
        .select()
        .single();

    if (error) {
        console.error("❌ ARTIST_INSERT_ERROR:", error);
        throw new Error(`Failed to create artist: ${error.message}`);
    }

    console.log("✅ ARTIST_CREATED:", { 
        artistId: newArtist.id, 
        name: artistData.name,
        spotify_id: artistData.spotify_id 
    });
    return newArtist;
}

async function getOrCreateAlbum(
    supabase: any,
    albumData: {
        title: string;
        spotify_id: string | null;
        artist_id: number;
        cover_image_url?: string;
        release_date?: string | null;
        description?: string | null;
        user_id: string;
    }
) {
    console.log("💿 GET_OR_CREATE_ALBUM:", {
        title: albumData.title,
        spotify_id: albumData.spotify_id,
        artist_id: albumData.artist_id
    });

    // Check if album exists by spotify_id (only if spotify_id is provided)
    if (albumData.spotify_id) {
        const { data: existingAlbum, error: selectError } = await supabase
            .from("albums")
            .select("*")
            .eq("spotify_id", albumData.spotify_id)
            .single();

        if (selectError && selectError.code !== 'PGRST116') {
            console.error("❌ ALBUM_SELECT_ERROR:", selectError);
            throw new Error(`Failed to query album: ${selectError.message}`);
        }

        if (existingAlbum) {
            console.log("💿 ALBUM_EXISTS:", { 
                albumId: existingAlbum.id, 
                title: albumData.title,
                spotify_id: albumData.spotify_id 
            });
            return existingAlbum;
        }
    } else {
        // If no spotify_id, check by title, artist_id and user_id to avoid duplicates
        const { data: existingAlbum, error: selectError } = await supabase
            .from("albums")
            .select("*")
            .eq("title", albumData.title)
            .eq("artist_id", albumData.artist_id)
            .eq("user_id", albumData.user_id)
            .is("spotify_id", null)
            .single();

        if (selectError && selectError.code !== 'PGRST116') {
            console.error("❌ ALBUM_SELECT_ERROR:", selectError);
            throw new Error(`Failed to query album: ${selectError.message}`);
        }

        if (existingAlbum) {
            console.log("💿 ALBUM_EXISTS_BY_TITLE:", { 
                albumId: existingAlbum.id, 
                title: albumData.title,
                artist_id: albumData.artist_id
            });
            return existingAlbum;
        }
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

    console.log("💿 ALBUM_INSERT_DATA:", insertData);

    const { data: newAlbum, error } = await supabase
        .from("albums")
        .insert(insertData)
        .select()
        .single();

    if (error) {
        console.error("❌ ALBUM_INSERT_ERROR:", error);
        throw new Error(`Failed to create album: ${error.message}`);
    }

    console.log("✅ ALBUM_CREATED:", { 
        albumId: newAlbum.id, 
        title: albumData.title,
        spotify_id: albumData.spotify_id 
    });
    return newAlbum;
}