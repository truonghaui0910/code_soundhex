import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Track } from "@/lib/definitions/Track";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

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
        artist:artist_id(id, name, profile_image_url),
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
        artist:artist_id(id, name, profile_image_url),
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
    const supabase = createClientComponentClient<Database>();

    const { data, error } = await supabase
      .from("tracks")
      .select(`
        *,
        artist:artist_id(id, name, profile_image_url),
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
      .select(`id, title, description, duration, file_url, created_at, album_id, artist_id, genre_id`)
      .eq("album_id", albumId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`Error fetching tracks for album ${albumId}:`, error);
      throw new Error(`Failed to fetch tracks: ${error.message}`);
    }

    // Lấy thông tin artist, album, genre cho từng track
    const artistIds = Array.from(new Set((data ?? []).map((track: any) => track.artist_id)));
    const albumIds = Array.from(new Set((data ?? []).map((track: any) => track.album_id)));
    const genreIds = Array.from(new Set((data ?? []).map((track: any) => track.genre_id).filter(Boolean)));

    let artistsMap: Record<number, { id: number; name: string }> = {};
    let albumsMap: Record<number, { id: number; title: string; cover_image_url: string | null }> = {};
    let genresMap: Record<number, { id: number; name: string }> = {};

    if (artistIds.length > 0) {
      const { data: artistsData } = await supabase.from("artists").select("id, name, profile_image_url").in("id", artistIds);
      if (artistsData) {
        for (const artist of artistsData) {
          artistsMap[artist.id] = { id: artist.id, name: artist.name, profile_image_url: artist.profile_image_url };
        }
      }
    }
    if (albumIds.length > 0) {
      const { data: albumsData } = await supabase.from("albums").select("id, title, cover_image_url").in("id", albumIds);
      if (albumsData) {
        for (const album of albumsData) {
          albumsMap[album.id] = { id: album.id, title: album.title, cover_image_url: album.cover_image_url };
        }
      }
    }
    if (genreIds.length > 0) {
      const { data: genresData } = await supabase.from("genres").select("id, name").in("id", genreIds);
      if (genresData) {
        for (const genre of genresData) {
          genresMap[genre.id] = { id: genre.id, name: genre.name };
        }
      }
    }

    // Gán thông tin phụ cho từng track
    const tracksWithInfo = (data ?? []).map((track: any) => ({
      ...track,
      artist: artistsMap[track.artist_id] || { id: track.artist_id, name: "Unknown Artist", profile_image_url: null },
      album: albumsMap[track.album_id] || { id: track.album_id, title: "Unknown Album", cover_image_url: null },
      genre: track.genre_id ? (genresMap[track.genre_id] || { id: track.genre_id, name: "Unknown Genre" }) : null,
    }));
    return tracksWithInfo;
  }

  /**
   * Lấy danh sách bài hát theo nghệ sĩ
   */
  static async getTracksByArtist(artistId: number): Promise<Track[]> {
    const supabase = createClientComponentClient<Database>();

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

    const tracksWithInfo = (data ?? []).map((track: any) => ({
      ...track,
      artist: track.artist ? {
        id: track.artist.id,
        name: track.artist.name,
        profile_image_url: null
      } : null,
      album: track.album ? {
        id: track.album.id,
        title: track.album.title,
        cover_image_url: track.album.cover_image_url
      } : null,
      genre: track.genre ? {
        id: track.genre.id,
        name: track.genre.name
      } : null,
    }));
    return tracksWithInfo;
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