import {
  createClientComponentClient,
  createServerComponentClient,
} from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

export interface Album {
  id: number;
  title: string;
  cover_image_url: string | null;
  custom_url?: string | null;
  artist: {
    id: number;
    name: string;
    custom_url?: string;
  };
  release_date: string | null;
}

export class AlbumsController {
  static async getUserAlbums(userId: string): Promise<Album[]> {
    console.log("AlbumsController.getUserAlbums - Starting fetch for user:", userId);
    const supabase = createClientComponentClient<Database>();

    const { data, error } = await supabase
      .from("albums")
      .select(`id, title, cover_image_url, custom_url, release_date, created_at, artist_id, user_id`)
      .eq('user_id', userId)
      // .eq('import_source', 'direct') // Chỉ lấy albums được tạo direct, không phải import từ Spotify
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching user albums:", error);
      throw new Error(`Failed to fetch user albums: ${error.message}`);
    }

    // Lấy danh sách artist_id duy nhất
    const artistIds = Array.from(
      new Set((data ?? []).map((album: any) => album.artist_id)),
    );
    let artistsMap: Record<number, { id: number; name: string; custom_url?: string }> = {};
    if (artistIds.length > 0) {
      const { data: artistsData, error: artistError } = await supabase
        .from("artists")
        .select("id, name, custom_url")
        .in("id", artistIds);
      if (!artistError && artistsData) {
        for (const artist of artistsData) {
          artistsMap[artist.id] = { id: artist.id, name: artist.name, custom_url: artist.custom_url };
        }
      }
    }

    // Gán thông tin artist vào album
    const albumsWithArtist = (data ?? []).map((album: any) => ({
      ...album,
      artist: artistsMap[album.artist_id] || {
        id: album.artist_id,
        name: "Unknown Artist",
      },
    }));
    return albumsWithArtist;
  }

  static async getAllAlbums(): Promise<Album[]> {
    console.log("🎵 AlbumsController.getAllAlbums - Starting fetch");
    const supabase = createServerComponentClient<Database>({ cookies });
    const { data, error } = await supabase
      .from("albums")
      .select(`id, title, cover_image_url, custom_url, release_date, created_at, artist_id, user_id, artists(id, name, custom_url)`)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("❌ Error fetching albums:", error);
      throw new Error(`Failed to fetch albums: ${error.message}`);
    }

    // Lấy danh sách artist_id duy nhất
    const artistIds = Array.from(
      new Set((data ?? []).map((album: any) => album.artist_id)),
    );
    let artistsMap: Record<number, { id: number; name: string; custom_url?: string }> = {};
    if (artistIds.length > 0) {
      const { data: artistsData, error: artistError } = await supabase
        .from("artists")
        .select("id, name, custom_url")
        .in("id", artistIds);
      if (!artistError && artistsData) {
        for (const artist of artistsData) {
          artistsMap[artist.id] = { id: artist.id, name: artist.name, custom_url: artist.custom_url };
        }
      }
    }

    // Gán thông tin artist vào album
    const albumsWithArtist = (data ?? []).map((album: any) => ({
      ...album,
      artist: artistsMap[album.artist_id] || {
        id: album.artist_id,
        name: "Unknown Artist",
      },
    }));
    return albumsWithArtist;
  }

  static async getAlbumsWithLimit(limit: number): Promise<Album[]> {
    console.log(`🎵 AlbumsController.getAlbumsWithLimit - Starting fetch with limit: ${limit}`);
    const supabase = createServerComponentClient<Database>({ cookies });
    const { data, error } = await supabase
      .from("albums")
      .select(`id, title, cover_image_url, custom_url, release_date, created_at, artist_id, user_id`)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("❌ Error fetching albums with limit:", error);
      throw new Error(`Failed to fetch albums: ${error.message}`);
    }

    // Lấy danh sách artist_id duy nhất
    const artistIds = Array.from(
      new Set((data ?? []).map((album: any) => album.artist_id)),
    );
    let artistsMap: Record<number, { id: number; name: string; custom_url?: string }> = {};
    if (artistIds.length > 0) {
      const { data: artistsData, error: artistError } = await supabase
        .from("artists")
        .select("id, name, custom_url")
        .in("id", artistIds);
      if (!artistError && artistsData) {
        for (const artist of artistsData) {
          artistsMap[artist.id] = { id: artist.id, name: artist.name, custom_url: artist.custom_url };
        }
      }
    }

    // Gán thông tin artist vào album
    const albumsWithArtist = (data ?? []).map((album: any) => ({
      ...album,
      artist: artistsMap[album.artist_id] || {
        id: album.artist_id,
        name: "Unknown Artist",
      },
    }));
    return albumsWithArtist;
  }

  static async getAlbumsWithPagination(page: number = 1, limit: number = 10): Promise<{ albums: Album[], total: number, totalPages: number }> {
    console.log(`🎵 AlbumsController.getAlbumsWithPagination - Starting fetch with page: ${page}, limit: ${limit}`);
    const supabase = createServerComponentClient<Database>({ cookies });

    const offset = (page - 1) * limit;

    // Get total count first
    const { count, error: countError } = await supabase
      .from("albums")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("❌ Error fetching albums count:", countError);
      throw new Error(`Failed to fetch albums count: ${countError.message}`);
    }

    // Get paginated data
    const { data, error } = await supabase
      .from("albums")
      .select(`id, title, cover_image_url, custom_url, release_date, created_at, artist_id, user_id`)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("❌ Error fetching albums with pagination:", error);
      throw new Error(`Failed to fetch albums: ${error.message}`);
    }

    // Lấy danh sách artist_id duy nhất
    const artistIds = Array.from(
      new Set((data ?? []).map((album: any) => album.artist_id)),
    );
    let artistsMap: Record<number, { id: number; name: string; custom_url?: string }> = {};
    if (artistIds.length > 0) {
      const { data: artistsData, error: artistError } = await supabase
        .from("artists")
        .select("id, name, custom_url")
        .in("id", artistIds);
      if (!artistError && artistsData) {
        for (const artist of artistsData) {
          artistsMap[artist.id] = { id: artist.id, name: artist.name, custom_url: artist.custom_url };
        }
      }
    }

    // Gán thông tin artist vào album
    const albumsWithArtist = (data ?? []).map((album: any) => ({
      ...album,
      artist: artistsMap[album.artist_id] || {
        id: album.artist_id,
        name: "Unknown Artist",
      },
    }));

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      albums: albumsWithArtist,
      total,
      totalPages
    };
  }

  static async getAlbumById(id: number): Promise<Album | null> {
    console.log("AlbumsController.getAlbumById - Starting fetch for id:", id);
    const supabase = createServerComponentClient<Database>({ cookies });

    const { data, error } = await supabase
      .from("albums")
      .select(`
        id, 
        title, 
        cover_image_url, 
        custom_url,
        release_date, 
        created_at, 
        artist_id, 
        user_id,
        artist:artist_id(id, name, custom_url)
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching album:", error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      ...data,
      artist: data.artist || {
        id: data.artist_id,
        name: "Unknown Artist",
      },
    };
  }

  static async getAlbumByCustomUrl(customUrl: string): Promise<Album | null> {
    console.log("AlbumsController.getAlbumByCustomUrl - Starting fetch for custom_url:", customUrl);
    const supabase = createServerComponentClient<Database>({ cookies });

    const { data, error } = await supabase
      .from("albums")
      .select(`
        id, 
        title, 
        cover_image_url, 
        custom_url,
        release_date, 
        created_at, 
        artist_id, 
        user_id,
        artist:artist_id(id, name, custom_url)
      `)
      .eq("custom_url", customUrl)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows found
      }
      console.error("Error fetching album by custom_url:", error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      ...data,
      artist: data.artist || {
        id: data.artist_id,
        name: "Unknown Artist",
      },
    };
  }

  static async updateAlbum(id: number, albumData: Partial<Album>): Promise<Album> {
    const supabase = createServerComponentClient<Database>({ cookies });

    const { data, error } = await supabase
      .from('albums')
      .update(albumData)
      .eq('id', id)
      .select(`
        *,
        artist:artist_id(id, name, custom_url)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to update album: ${error.message}`);
    }

    return data;
  }

  static async searchAlbums(query: string, limit: number = 20): Promise<Album[]> {
    console.log(`🔍 AlbumsController.searchAlbums - Starting search for: "${query}" with limit: ${limit}`);
    const supabase = createServerComponentClient<Database>({ cookies });

    const searchTerm = query.toLowerCase();

    const { data, error } = await supabase
      .from("albums")
      .select(`
        *,
        artist:artist_id(id, name, profile_image_url, custom_url)
      `)
      .ilike("title", `%${searchTerm}%`)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error searching albums:", error);
      throw new Error(`Failed to search albums: ${error.message}`);
    }

    return data ?? [];
  }

  static async getRecommendedAlbums(albumId: number, limit: number = 12) {
        try {
            const supabase = createServerComponentClient<Database>({ cookies });
            console.log('🎵 AlbumsController.getRecommendedAlbums - Starting for album:', albumId);
            
            // Step 1: Tìm genre_id từ tracks của album hiện tại
            const { data: albumTracks } = await supabase
                .from('tracks')
                .select('genre_id')
                .eq('album_id', albumId)
                .not('genre_id', 'is', null)
                .limit(1);

            console.log('🎵 Album tracks with genre:', albumTracks);

            if (!albumTracks || albumTracks.length === 0) {
                console.log('⚠️ No tracks with genre found for album:', albumId);
                // Fallback: return random albums
                const { data: randomAlbums, error } = await supabase
                    .from('albums')
                    .select(`
                        id,
                        title,
                        cover_image_url,
                        release_date,
                        custom_url,
                        artist_id
                    `)
                    .neq('id', albumId)
                    .order('created_at', { ascending: false })
                    .limit(limit);

                if (error || !randomAlbums) return [];

                // Get artist info
                const artistIds = [...new Set(randomAlbums.map(a => a.artist_id))];
                const { data: artists } = await supabase
                    .from('artists')
                    .select('id, name, custom_url')
                    .in('id', artistIds);

                const artistMap = (artists || []).reduce((map, artist) => {
                    map[artist.id] = artist;
                    return map;
                }, {} as Record<number, any>);

                return randomAlbums.map(album => ({
                    ...album,
                    artist: artistMap[album.artist_id] || {
                        id: album.artist_id,
                        name: 'Unknown Artist',
                        custom_url: null
                    }
                }));
            }

            const genreId = albumTracks[0].genre_id;
            console.log('🔍 Found genre_id:', genreId);

            // Step 2: Tìm tracks khác có cùng genre nhưng khác album
            const { data: similarTracks } = await supabase
                .from('tracks')
                .select('album_id')
                .eq('genre_id', genreId)
                .neq('album_id', albumId)
                .not('album_id', 'is', null);

            console.log('🎵 Found similar tracks count:', similarTracks?.length || 0);

            if (!similarTracks || similarTracks.length === 0) {
                console.log('⚠️ No similar tracks found');
                return [];
            }

            // Step 3: Lấy danh sách album_id unique
            const uniqueAlbumIds = [...new Set(similarTracks.map(track => track.album_id))];
            console.log('🎵 Unique album IDs:', uniqueAlbumIds.length);

            // Step 4: Query thông tin albums
            const { data: albums, error } = await supabase
                .from('albums')
                .select(`
                    id,
                    title,
                    cover_image_url,
                    release_date,
                    custom_url,
                    artist_id
                `)
                .in('id', uniqueAlbumIds)
                .limit(limit);

            if (error) {
                console.error('❌ Error fetching recommended albums:', error);
                return [];
            }

            console.log('🎵 Found recommended albums:', albums?.length || 0);

            if (!albums || albums.length === 0) {
                console.log('⚠️ No recommended albums found');
                return [];
            }

            // Get artist information
            const artistIds = [...new Set(albums.map(a => a.artist_id))];
            const { data: artists } = await supabase
                .from('artists')
                .select('id, name, custom_url')
                .in('id', artistIds);

            // Create artist map
            const artistMap = (artists || []).reduce((map, artist) => {
                map[artist.id] = artist;
                return map;
            }, {} as Record<number, any>);

            // Transform to include artist as nested object
            const transformedAlbums = albums.map(album => ({
                ...album,
                artist: artistMap[album.artist_id] || {
                    id: album.artist_id,
                    name: 'Unknown Artist',
                    custom_url: null
                }
            }));

            console.log('✅ Recommended albums transformed, final count:', transformedAlbums.length);
            return transformedAlbums;
        } catch (error) {
            console.error('❌ Error in getRecommendedAlbums:', error);
            return [];
        }
    }
}