import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Track } from "@/lib/definitions/Track";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

/**
 * Controller để xử lý các tác vụ liên quan đến tracks
 */
export class TracksController {
  static async getTracksByIds(ids: number[]): Promise<Track[]> {
    console.log("TracksController.getTracksByIds - Starting fetch for IDs:", ids);
    const supabase = createServerComponentClient<Database>({ cookies });

    const { data, error } = await supabase
      .from("tracks")
      .select(`
        id, title, description, duration, file_url, source_type, created_at, view_count,
        artist:artist_id (id, name, profile_image_url),
        album:album_id (id, title, cover_image_url),
        genre:genre_id (id, name)
      `)
      .in('id', ids)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tracks by IDs:", error);
      throw new Error(`Failed to fetch tracks: ${error.message}`);
    }

    return data as Track[];
  }

  static async getAllTracks(): Promise<Track[]> {
    const supabase = createServerComponentClient<Database>({ cookies });

    const { data, error } = await supabase
      .from("tracks")
      .select(`
        *, view_count,
        artist:artist_id(id, name, profile_image_url, custom_url),
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
        *, view_count,
        artist:artist_id(id, name, profile_image_url, custom_url),
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
        *, view_count,
        artist:artist_id(id, name, profile_image_url, custom_url),
        album:album_id(id, title, cover_image_url),
        genre:genre_id(id, name)
      `)
      .eq("artist_id", artistId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`Error fetching tracks for artist ${artistId}:`, error);
      throw new Error(`Failed to fetch tracks: ${error.message}`);
    }

    console.log(`TracksController.getTracksByArtist - Found ${data?.length || 0} tracks`);
    console.log(`TracksController.getTracksByArtist - Sample view_count:`, data?.[0]?.view_count);

    return data as unknown as Track[];
  }

  /**
   * Lấy danh sách bài hát theo album
   */
  static async getTracksByAlbum(albumId: number): Promise<Track[]> {
    console.log(`🎵 TracksController.getTracksByAlbum - Starting fetch for album ${albumId}`);
    const supabase = createServerComponentClient<Database>({ cookies });

    const { data, error } = await supabase
      .from("tracks")
      .select(`id, title, description, duration, file_url, created_at, album_id, artist_id, genre_id, view_count`)
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

    let artistsMap: Record<number, { id: number; name: string; custom_url?: string | null }> = {};
    let albumsMap: Record<number, { id: number; title: string; cover_image_url: string | null }> = {};
    let genresMap: Record<number, { id: number; name: string }> = {};

    if (artistIds.length > 0) {
      const { data: artistsData } = await supabase.from("artists").select("id, name, profile_image_url, custom_url").in("id", artistIds);
      if (artistsData) {
        for (const artist of artistsData) {
          artistsMap[artist.id] = { id: artist.id, name: artist.name, custom_url: artist.custom_url };
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
      artist: artistsMap[track.artist_id] || { id: track.artist_id, name: "Unknown Artist", profile_image_url: null, custom_url: null },
      album: albumsMap[track.album_id] || { id: track.album_id, title: "Unknown Album", cover_image_url: null },
      genre: track.genre_id ? (genresMap[track.genre_id] || { id: track.genre_id, name: "Unknown Genre" }) : null,
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
        *, view_count,
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
   * Tìm kiếm bài hát theo từ khóa (tên bài hát, nghệ sỹ, album)
   */
  static async searchTracks(query: string): Promise<Track[]> {
    const supabase = createServerComponentClient<Database>({ cookies });

    // Convert query to lowercase for case-insensitive search
    const searchTerm = query.toLowerCase();

    // First, get matching artist and album IDs
    const { data: artistsData } = await supabase
      .from("artists")
      .select("id")
      .ilike("name", `%${searchTerm}%`);

    const { data: albumsData } = await supabase
      .from("albums")
      .select("id")
      .ilike("title", `%${searchTerm}%`);

    const artistIds = artistsData?.map(a => a.id) || [];
    const albumIds = albumsData?.map(a => a.id) || [];

    // Build the query conditions
    let query_builder = supabase
      .from("tracks")
      .select(`
        *, view_count,
        artist:artist_id(id, name, profile_image_url, custom_url),
        album:album_id(id, title, cover_image_url, custom_url),
        genre:genre_id(id, name)
      `);

    // Create OR conditions array
    const conditions = [];
    conditions.push(`title.ilike.%${searchTerm}%`);
    conditions.push(`description.ilike.%${searchTerm}%`);
    
    if (artistIds.length > 0) {
      conditions.push(`artist_id.in.(${artistIds.join(',')})`);
    }
    
    if (albumIds.length > 0) {
      conditions.push(`album_id.in.(${albumIds.join(',')})`);
    }

    console.log('Search conditions:', conditions);
    console.log('Artist IDs found:', artistIds);
    console.log('Album IDs found:', albumIds);

    const { data, error } = await query_builder
      .or(conditions.join(','))
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`Error searching tracks for "${query}":`, error);
      throw new Error(`Failed to search tracks: ${error.message}`);
    }

    console.log('Search results:', data?.length || 0, 'tracks found');
    return data as unknown as Track[];
  }

  /**
   * Lấy danh sách bài hát theo IDs
   */
  static async getTracksByIds(trackIds: number[]): Promise<Track[]> {
    const supabase = createServerComponentClient<Database>({ cookies });

    const { data, error } = await supabase
      .from("tracks")
      .select(`
        id, title, description, duration, file_url, source_type, created_at, view_count,
        artist:artist_id(id, name, profile_image_url),
        album:album_id(id, title, cover_image_url),
        genre:genre_id(id, name)
      `)
      .in("id", trackIds)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`Error fetching tracks by IDs:`, error);
      throw new Error(`Failed to fetch tracks: ${error.message}`);
    }

    return data as unknown as Track[];
  }

  /**
   * Lấy danh sách bài hát với phân trang, tìm kiếm và filter từ server
   */
  static async getTracksWithPagination({
    page = 1,
    limit = 50,
    search = '',
    genre = 'all'
  }: {
    page?: number;
    limit?: number;
    search?: string;
    genre?: string;
  }): Promise<{ tracks: Track[]; total: number; totalPages: number }> {
    const supabase = createServerComponentClient<Database>({ cookies });

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build base query
    let query = supabase
      .from("tracks")
      .select(`
        *, view_count,
        artist:artist_id(id, name, profile_image_url, custom_url),
        album:album_id(id, title, cover_image_url, custom_url),
        genre:genre_id(id, name)
      `, { count: 'exact' });

    // Apply search filter if provided
    if (search && search.trim()) {
      const searchTerm = search.toLowerCase();

      // First, get matching artist and album IDs
      const { data: artistsData } = await supabase
        .from("artists")
        .select("id")
        .ilike("name", `%${searchTerm}%`);

      const { data: albumsData } = await supabase
        .from("albums")
        .select("id")
        .ilike("title", `%${searchTerm}%`);

      const artistIds = artistsData?.map(a => a.id) || [];
      const albumIds = albumsData?.map(a => a.id) || [];

      // Create OR conditions array
      const conditions = [];
      conditions.push(`title.ilike.%${searchTerm}%`);
      conditions.push(`description.ilike.%${searchTerm}%`);
      
      if (artistIds.length > 0) {
        conditions.push(`artist_id.in.(${artistIds.join(',')})`);
      }
      
      if (albumIds.length > 0) {
        conditions.push(`album_id.in.(${albumIds.join(',')})`);
      }

      query = query.or(conditions.join(','));
    }

    // Apply genre filter if provided and not 'all'
    if (genre && genre !== 'all') {
      // Get genre ID by name
      const { data: genreData } = await supabase
        .from("genres")
        .select("id")
        .eq("name", genre)
        .single();

      if (genreData) {
        query = query.eq("genre_id", genreData.id);
      }
    }

    // Apply pagination and ordering
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching tracks with pagination:", error);
      throw new Error(`Failed to fetch tracks: ${error.message}`);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      tracks: data as unknown as Track[],
      total,
      totalPages
    };
  }
}