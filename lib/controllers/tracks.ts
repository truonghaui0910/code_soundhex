import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Track } from "@/lib/definitions/Track";
import { Database } from "@/types/supabase";

/**
 * Controller để xử lý các tác vụ liên quan đến tracks
 */
export class TracksController {
  /**
   * Lấy danh sách tất cả các bài hát
   */
  static async getAllTracks(): Promise<Track[]> {
    const supabase = createServerComponentClient<Database>({ cookies });
    
    const { data, error } = await supabase
      .from("tracks")
      .select(`
        *,
        artist:artist_id(id, name),
        album:album_id(id, title, cover_image_url),
        genre:genre_id(id, name)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tracks:", error);
      throw new Error(`Failed to fetch tracks: ${error.message}`);
    }

    return data as unknown as Track[];
  }

  /**
   * Lấy thông tin một bài hát theo ID
   */
  static async getTrackById(id: number): Promise<Track | null> {
    const supabase = createServerComponentClient<Database>({ cookies });
    
    const { data, error } = await supabase
      .from("tracks")
      .select(`
        *,
        artist:artist_id(id, name),
        album:album_id(id, title, cover_image_url),
        genre:genre_id(id, name)
      `)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Record not found
        return null;
      }
      console.error(`Error fetching track ${id}:`, error);
      throw new Error(`Failed to fetch track: ${error.message}`);
    }

    return data as unknown as Track;
  }

  /**
   * Lấy danh sách bài hát theo nghệ sĩ
   */
  static async getTracksByArtist(artistId: number): Promise<Track[]> {
    const supabase = createServerComponentClient<Database>({ cookies });
    
    const { data, error } = await supabase
      .from("tracks")
      .select(`
        *,
        artist:artist_id(id, name),
        album:album_id(id, title, cover_image_url),
        genre:genre_id(id, name)
      `)
      .eq("artist_id", artistId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`Error fetching tracks for artist ${artistId}:`, error);
      throw new Error(`Failed to fetch tracks: ${error.message}`);
    }

    return data as unknown as Track[];
  }

  /**
   * Lấy danh sách bài hát theo album
   */
  static async getTracksByAlbum(albumId: number): Promise<Track[]> {
    const supabase = createServerComponentClient<Database>({ cookies });
    
    const { data, error } = await supabase
      .from("tracks")
      .select(`
        *,
        artist:artist_id(id, name),
        album:album_id(id, name, cover_url),
        genre:genre_id(id, name)
      `)
      .eq("album_id", albumId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`Error fetching tracks for album ${albumId}:`, error);
      throw new Error(`Failed to fetch tracks: ${error.message}`);
    }

    return data as unknown as Track[];
  }

  /**
   * Lấy danh sách bài hát theo thể loại
   */
  static async getTracksByGenre(genreId: number): Promise<Track[]> {
    const supabase = createServerComponentClient<Database>({ cookies });
    
    const { data, error } = await supabase
      .from("tracks")
      .select(`
        *,
        artist:artist_id(id, name),
        album:album_id(id, name, cover_url),
        genre:genre_id(id, name)
      `)
      .eq("genre_id", genreId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`Error fetching tracks for genre ${genreId}:`, error);
      throw new Error(`Failed to fetch tracks: ${error.message}`);
    }

    return data as unknown as Track[];
  }

  /**
   * Tìm kiếm bài hát theo từ khóa
   */
  static async searchTracks(query: string): Promise<Track[]> {
    const supabase = createServerComponentClient<Database>({ cookies });
    
    // Convert query to lowercase for case-insensitive search
    const searchTerm = query.toLowerCase();
    
    const { data, error } = await supabase
      .from("tracks")
      .select(`
        *,
        artist:artist_id(id, name),
        album:album_id(id, name, cover_url),
        genre:genre_id(id, name)
      `)
      .or(`
        title.ilike.%${searchTerm}%,
        description.ilike.%${searchTerm}%
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`Error searching tracks for "${query}":`, error);
      throw new Error(`Failed to search tracks: ${error.message}`);
    }

    return data as unknown as Track[];
  }
}