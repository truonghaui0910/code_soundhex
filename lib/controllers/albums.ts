
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

export interface Album {
  id: number;
  title: string;
  cover_image_url: string | null;
  artist: {
    id: number;
    name: string;
  };
  release_date: string | null;
}

export class AlbumsController {
  static async getAllAlbums(): Promise<Album[]> {
    const supabase = createClientComponentClient<Database>();
    const { data, error } = await supabase
      .from("albums")
      .select(`id, title, cover_image_url, release_date, created_at, artist_id`) 
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching albums:", error);
      throw new Error(`Failed to fetch albums: ${error.message}`);
    }

    // Lấy danh sách artist_id duy nhất
    const artistIds = Array.from(new Set((data ?? []).map((album: any) => album.artist_id)));
    let artistsMap: Record<number, { id: number; name: string }> = {};
    if (artistIds.length > 0) {
      const { data: artistsData, error: artistError } = await supabase
        .from("artists")
        .select("id, name")
        .in("id", artistIds);
      if (!artistError && artistsData) {
        for (const artist of artistsData) {
          artistsMap[artist.id] = { id: artist.id, name: artist.name };
        }
      }
    }

    // Gán thông tin artist vào album
    const albumsWithArtist = (data ?? []).map((album: any) => ({
      ...album,
      artist: artistsMap[album.artist_id] || { id: album.artist_id, name: "Unknown Artist" },
    }));
    return albumsWithArtist;
  }
}
