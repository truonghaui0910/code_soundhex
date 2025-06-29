import { createClientComponentClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

export interface Artist {
  id: number;
  name: string;
  profile_image_url: string | null;
  bio: string | null;
  created_at: string;
}

export class ArtistsController {
  static async getArtistById(id: number): Promise<Artist | null> {
    const supabase = createServerComponentClient<Database>({ cookies });
    const { data, error } = await supabase
      .from("artists")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching artist:", error);
      return null;
    }

    return data as Artist;
  }

  static async getAllArtists(): Promise<Artist[]> {
    console.log("🎤 ArtistsController.getAllArtists - Starting fetch");
    const supabase = createServerComponentClient<Database>({ cookies });
    const { data, error } = await supabase
      .from("artists")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching artists:", error);
      throw new Error(`Failed to fetch artists: ${error.message}`);
    }

    console.log("✅ Artists fetched successfully:", {
      count: data?.length || 0,
      artistIds: data?.map(a => a.id) || [],
      artistNames: data?.map(a => a.name) || []
    });

    return data as Artist[];
  }
}