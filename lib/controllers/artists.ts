import {
  createClientComponentClient,
  createServerComponentClient,
} from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

interface Artist {
  id: number;
  name: string;
  profile_image_url: string | null;
  bio: string | null;
  created_at: string | null;
  custom_url: string | null;
  social: string[] | null;
  user_id: string | null;
}

export class ArtistsController {
  static async getUserArtists(userId: string): Promise<Artist[]> {
    console.log(
      "ArtistsController.getUserArtists - Starting fetch for user:",
      userId,
    );
    const supabase = createClientComponentClient<Database>();

    const { data, error } = await supabase
      .from("artists")
      .select(`id, name, profile_image_url,bio, created_at`)
      .eq("user_id", userId)
      // .eq('import_source', 'direct') // Chỉ lấy artists được tạo direct, không phải import từ Spotify
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user artists:", error);
      throw new Error(`Failed to fetch user artists: ${error.message}`);
    }

    return data ?? [];
  }

  static async getAllArtists(): Promise<Artist[]> {
    console.log(" ArtistsController.getAllArtists - Starting fetch");
    const supabase = createServerComponentClient<Database>({ cookies });

    const { data, error } = await supabase
      .from("artists")
      .select(`id, name, profile_image_url, bio, created_at, custom_url, social, user_id`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching artists:", error);
      throw new Error(`Failed to fetch artists: ${error.message}`);
    }

    // Convert social from database format to array if needed
    const artists = (data ?? []).map(artist => {
      if (artist.social && typeof artist.social === 'string') {
        try {
          artist.social = JSON.parse(artist.social);
        } catch (e) {
          artist.social = [];
        }
      }
      return artist;
    });

    return artists;
  }

  static async getArtistById(id: number): Promise<Artist | null> {
    const supabase = createServerComponentClient<Database>({ cookies });
    const { data, error } = await supabase
      .from("artists")
      .select("id, name, profile_image_url, bio, created_at, custom_url, social, user_id")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching artist:", error);
      return null;
    }

    // Convert social from database format to array if needed
    const artist = data as Artist;
    if (artist.social && typeof artist.social === 'string') {
      try {
        const parsed = JSON.parse(artist.social);
        artist.social = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        artist.social = [];
      }
    } else if (!artist.social) {
      artist.social = [];
    }

    return artist;
  }

  static async updateArtist(id: number, data: Partial<Artist>): Promise<Artist> {
    const supabase = createServerComponentClient<Database>({ cookies });
    const { data: artist, error } = await supabase
      .from('artists')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // Parse social from JSON string if needed
    if (artist.social && typeof artist.social === 'string') {
      try {
        artist.social = JSON.parse(artist.social);
      } catch (e) {
        artist.social = [];
      }
    } else if (!artist.social) {
      artist.social = [];
    }
    
    return artist;
  }

  static async checkCustomUrlAvailable(customUrl: string, excludeId?: number): Promise<boolean> {
    const supabase = createServerComponentClient<Database>({ cookies });
    let query = supabase
      .from("artists")
      .select("id")
      .eq("custom_url", customUrl);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data.length === 0;
  }

  static async getArtistByCustomUrl(customUrl: string): Promise<Artist | null> {
    const supabase = createServerComponentClient<Database>({ cookies });
    const { data: artist, error } = await supabase
      .from('artists')
      .select('*')
      .eq('custom_url', customUrl)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows found
      }
      throw error;
    }

    return artist;
  }
}