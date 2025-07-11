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
      .select(`id, name, profile_image_url,bio, created_at`)
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
      .select("id, name, profile_image_url,bio, created_at")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching artist:", error);
      return null;
    }

    return data as Artist;
  }
}
