import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";
import { generateSlug, generateUniqueCustomUrl } from '@/lib/utils';

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
        // Update existing artist with new data
        const updateData: any = {};
        
        if (artistData.name && artistData.name !== existingArtist.name) {
            updateData.name = artistData.name;
        }
        
        if (artistData.profile_image_url && artistData.profile_image_url !== existingArtist.profile_image_url) {
            updateData.profile_image_url = artistData.profile_image_url;
        }
        
        if (artistData.user_id && artistData.user_id !== existingArtist.user_id) {
            updateData.user_id = artistData.user_id;
        }
        
        // Only update if there are changes
        if (Object.keys(updateData).length > 0) {
            updateData.updated_at = new Date().toISOString();
            
            const { data: updatedArtist, error: updateError } = await supabase
                .from("artists")
                .update(updateData)
                .eq("id", existingArtist.id)
                .select()
                .single();
                
            if (updateError) {
                console.error("ARTIST_UPDATE_ERROR:", updateError);
                throw new Error(`Failed to update artist: ${updateError.message}`);
            }
            
            return updatedArtist;
        }
        
        return existingArtist;
    }

    // Generate custom_url for artist
    const artistSlug = generateSlug(artistData.name);
    const artistCustomUrl = await generateUniqueCustomUrl(supabase, "artists", artistSlug);

    // Create new artist
    const insertData = {
        name: artistData.name,
        spotify_id: artistData.spotify_id,
        profile_image_url: artistData.profile_image_url || null,
        bio: null,
        user_id: artistData.user_id || null,
        custom_url: artistCustomUrl,
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

    const { name, spotify_id, profile_image_url, user_id } = body;

    if (!spotify_id || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const artist = await getOrCreateArtist(supabase, { name, spotify_id, profile_image_url, user_id });

    return NextResponse.json(artist);
  } catch (error) {
    console.error("SYNC_ARTIST_ERROR:", error);
    return NextResponse.json({ error: "Failed to sync artist" }, { status: 500 });
  }
} 