
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

export interface Artist {
  id: number;
  name: string;
  bio?: string | null;
  profile_image_url?: string | null;
  created_at: string;
}

export class ArtistsController {
  static async getAllArtists(): Promise<Artist[]> {
    const supabase = createServerComponentClient<Database>({ cookies });
    
    const { data, error } = await supabase
      .from("artists")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching artists:", error);
      throw new Error(`Failed to fetch artists: ${error.message}`);
    }

    return data || [];
  }

  static async getArtistById(id: number): Promise<Artist | null> {
    const supabase = createServerComponentClient<Database>({ cookies });
    
    const { data, error } = await supabase
      .from("artists")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Artist not found
      }
      console.error(`Error fetching artist ${id}:`, error);
      throw new Error(`Failed to fetch artist: ${error.message}`);
    }

    return data;
  }
}
