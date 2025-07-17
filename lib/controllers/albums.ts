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

  static async getAlbumById(id: number): Promise<Album | null> {
    console.log("🎵 AlbumsController.getAlbumById - Starting fetch for id:", id);
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
      console.error("❌ Error fetching album:", error);
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
}