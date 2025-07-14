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

    return data ?? [];
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

    return data as Artist;
  }

  static async getArtistByCustomUrl(customUrl: string): Promise<Artist | null> {
    const supabase = createServerComponentClient<Database>({ cookies });
    const { data, error } = await supabase
      .from("artists")
      .select("id, name, profile_image_url, bio, created_at, custom_url, social, user_id")
      .eq("custom_url", customUrl)
      .single();

    if (error) {
      console.error("Error fetching artist by custom URL:", error);
      return null;
    }

    return data as Artist;
  }

  static async updateArtist(id: number, updates: Partial<Artist>): Promise<Artist | null> {
    const supabase = createClientComponentClient<Database>();
    const { data, error } = await supabase
      .from("artists")
      .update(updates)
      .eq("id", id)
      .select("id, name, profile_image_url, bio, created_at, custom_url, social, user_id")
      .single();

    if (error) {
      console.error("Error updating artist:", error);
      throw new Error(`Failed to update artist: ${error.message}`);
    }

    return data as Artist;
  }

  static async checkCustomUrlAvailable(customUrl: string, excludeId?: number): Promise<boolean> {
    const supabase = createClientComponentClient<Database>();
    let query = supabase
      .from("artists")
      .select("id")
      .eq("custom_url", customUrl);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error checking custom URL availability:", error);
      return false;
    }

    return data.length === 0;
  }
}
