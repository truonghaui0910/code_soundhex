import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";
import { generateSlug, generateUniqueCustomUrl } from '@/lib/utils';

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

async function getOrCreateTrack(
    supabase: any,
    trackData: {
        title: string;
        spotify_id: string;
        artist_id: number;
        album_id: number;
        duration: number;
        file_url?: string;
        genre_name?: string;
        isrc?: string | null;
        preview_url?: string;
        popularity?: number;
        user_id: string;
        description?: string | null;
    }
) {
    // Check if track exists by spotify_id
    const { data: existingTrack, error: selectError } = await supabase
        .from("tracks")
        .select("*")
        .eq("spotify_id", trackData.spotify_id)
        .single();

    if (selectError && selectError.code !== 'PGRST116') {
        console.error("TRACK_SELECT_ERROR:", selectError);
        throw new Error(`Failed to query track: ${selectError.message}`);
    }

    if (existingTrack) {
        return existingTrack;
    }

    // Handle genre
    let genreId: number | null = null;
    if (trackData.genre_name) {
        const genre = await getOrCreateGenre(supabase, trackData.genre_name);
        if (genre) {
            genreId = genre.id;
        }
    }

    // Generate custom_url for track
    const trackSlug = generateSlug(trackData.title);
    const trackCustomUrl = await generateUniqueCustomUrl(supabase, "tracks", trackSlug);

    // Create new track
    const insertData = {
        title: trackData.title,
        description: trackData.description || null,
        duration: Math.round(trackData.duration),
        file_url: trackData.file_url || null,
        artist_id: trackData.artist_id,
        album_id: trackData.album_id,
        genre_id: genreId,
        source_type: "spotify",
        spotify_id: trackData.spotify_id,
        preview_url: trackData.preview_url || null,
        popularity: trackData.popularity || 0,
        isrc: trackData.isrc || null,
        user_id: trackData.user_id || null,
        custom_url: trackCustomUrl,
    };

    const { data: newTrack, error } = await supabase
        .from("tracks")
        .insert(insertData)
        .select()
        .single();

    if (error) {
        console.error("TRACK_INSERT_ERROR:", error);
        throw new Error(`Failed to create track: ${error.message}`);
    }
    return newTrack;
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (token !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Debug: Get raw body text first
    const bodyText = await request.text();
    console.log("api/sync/track Raw request body:", bodyText);

    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (jsonError) {
      console.error("JSON_PARSE_ERROR:", jsonError);
      console.error("Body that failed to parse:", bodyText);
      return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
    }



    const { title, spotify_id, artist_id, album_id, duration, file_url, genre_name, isrc, preview_url, popularity, user_id, description } = body;

    if (!spotify_id || !title || !artist_id || !album_id || !duration) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const track = await getOrCreateTrack(supabase, { title, spotify_id, artist_id, album_id, duration, file_url, genre_name, isrc, preview_url, popularity, user_id, description });

    return NextResponse.json(track);
  } catch (error) {
    console.error("SYNC_TRACK_ERROR:", error);
    return NextResponse.json({ error: "Failed to sync track" }, { status: 500 });
  }
} 