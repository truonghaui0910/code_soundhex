import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";
import { generateSlug, generateUniqueCustomUrl } from '@/lib/utils';

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
        // Update existing album with new data
        const updateData: any = {};
        
        if (albumData.title && albumData.title !== existingAlbum.title) {
            updateData.title = albumData.title;
        }
        
        if (albumData.cover_image_url && albumData.cover_image_url !== existingAlbum.cover_image_url) {
            updateData.cover_image_url = albumData.cover_image_url;
        }
        
        if (albumData.release_date && albumData.release_date !== existingAlbum.release_date) {
            updateData.release_date = albumData.release_date;
        }
        
        if (albumData.description && albumData.description !== existingAlbum.description) {
            updateData.description = albumData.description;
        }
        
        if (albumData.user_id && albumData.user_id !== existingAlbum.user_id) {
            updateData.user_id = albumData.user_id;
        }
        
        // Only update if there are changes
        if (Object.keys(updateData).length > 0) {
            updateData.updated_at = new Date().toISOString();
            
            const { data: updatedAlbum, error: updateError } = await supabase
                .from("albums")
                .update(updateData)
                .eq("id", existingAlbum.id)
                .select()
                .single();
                
            if (updateError) {
                console.error("ALBUM_UPDATE_ERROR:", updateError);
                throw new Error(`Failed to update album: ${updateError.message}`);
            }
            
            return updatedAlbum;
        }
        
        return existingAlbum;
    }

    // Generate custom_url for album
    const albumSlug = generateSlug(albumData.title);
    const albumCustomUrl = await generateUniqueCustomUrl(supabase, "albums", albumSlug);

    // Create new album
    const insertData = {
        title: albumData.title,
        spotify_id: albumData.spotify_id,
        artist_id: albumData.artist_id,
        cover_image_url: albumData.cover_image_url || null,
        release_date: albumData.release_date || null,
        description: albumData.description || null,
        user_id: albumData.user_id || null,
        custom_url: albumCustomUrl,
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

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (token !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Debug: Get raw body text first
    const bodyText = await request.text();
    console.log("Raw request body:", bodyText);

    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (jsonError) {
      console.error("JSON_PARSE_ERROR:", jsonError);
      console.error("Body that failed to parse:", bodyText);
      return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
    }

    const { title, spotify_id, artist_id, cover_image_url, release_date, description, user_id } = body;

    if (!spotify_id || !title || !artist_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const album = await getOrCreateAlbum(supabase, { title, spotify_id, artist_id, cover_image_url, release_date, description, user_id });

    return NextResponse.json(album);
  } catch (error) {
    console.error("SYNC_ALBUM_ERROR:", error);
    return NextResponse.json({ error: "Failed to sync album" }, { status: 500 });
  }
} 