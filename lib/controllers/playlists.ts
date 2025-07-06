import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

export interface Playlist {
  id: number;
  name: string;
  description?: string;
  cover_image_url?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  track_count?: number;
}

export interface PlaylistTrack {
  id: number;
  playlist_id: number;
  track_id: number;
  added_at: string;
  track?: {
    id: number;
    title: string;
    duration: number;
    artist: {
      id: number;
      name: string;
    };
    album: {
      id: number;
      title: string;
      cover_image_url?: string;
    };
  };
}

export class PlaylistsController {
  /**
   * Lấy tất cả playlist của user
   */
  static async getUserPlaylists(userId: string): Promise<Playlist[]> {
    const supabase = createServerComponentClient<Database>({ cookies });

    const { data, error } = await supabase
      .from("playlists")
      .select(`
        id, name, description, cover_image_url, user_id, created_at, updated_at,
        playlist_tracks(count)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user playlists:", error);
      throw new Error(`Failed to fetch playlists: ${error.message}`);
    }

    return (data || []).map((playlist: any) => ({
      ...playlist,
      track_count: playlist.playlist_tracks?.[0]?.count || 0
    }));
  }

  /**
   * Tạo playlist mới
   */
  static async createPlaylist(
    userId: string,
    name: string,
    description?: string,
    coverImageUrl?: string
  ): Promise<Playlist> {
    const supabase = createServerComponentClient<Database>({ cookies });

    const { data, error } = await supabase
      .from("playlists")
      .insert({
        name,
        description,
        cover_image_url: coverImageUrl,
        user_id: userId
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating playlist:", error);
      throw new Error(`Failed to create playlist: ${error.message}`);
    }

    return { ...data, track_count: 0 } as Playlist;
  }

  /**
   * Cập nhật playlist
   */
  static async updatePlaylist(
    playlistId: number,
    userId: string,
    updates: Partial<Pick<Playlist, "name" | "description" | "cover_image_url">>
  ): Promise<Playlist> {
    const supabase = createServerComponentClient<Database>({ cookies });

    const { data, error } = await supabase
      .from("playlists")
      .update(updates)
      .eq("id", playlistId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating playlist:", error);
      throw new Error(`Failed to update playlist: ${error.message}`);
    }

    return data as Playlist;
  }

  /**
   * Xóa playlist
   */
  static async deletePlaylist(playlistId: number, userId: string): Promise<void> {
    const supabase = createServerComponentClient<Database>({ cookies });

    const { error } = await supabase
      .from("playlists")
      .delete()
      .eq("id", playlistId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting playlist:", error);
      throw new Error(`Failed to delete playlist: ${error.message}`);
    }
  }

  /**
   * Lấy tracks trong playlist
   */
  static async getPlaylistTracks(playlistId: number): Promise<PlaylistTrack[]> {
    const supabase = createServerComponentClient<Database>({ cookies });

    const { data, error } = await supabase
      .from("playlist_tracks")
      .select(`
        id, playlist_id, track_id, added_at,
        track:tracks(
          id, title, duration,
          artist:artist_id(id, name),
          album:album_id(id, title, cover_image_url)
        )
      `)
      .eq("playlist_id", playlistId)
      .order("added_at", { ascending: false });

    if (error) {
      console.error("Error fetching playlist tracks:", error);
      throw new Error(`Failed to fetch playlist tracks: ${error.message}`);
    }

    return data as PlaylistTrack[];
  }

  /**
   * Thêm track vào playlist
   */
  static async addTrackToPlaylist(
    playlistId: number,
    trackId: number,
    userId: string
  ): Promise<PlaylistTrack> {
    const supabase = createServerComponentClient<Database>({ cookies });

    // Kiểm tra xem playlist có thuộc về user không
    const { data: playlist } = await supabase
      .from("playlists")
      .select("id")
      .eq("id", playlistId)
      .eq("user_id", userId)
      .single();

    if (!playlist) {
      throw new Error("Playlist not found or access denied");
    }

    // Kiểm tra xem track đã có trong playlist chưa
    const { data: existingTrack } = await supabase
      .from("playlist_tracks")
      .select("id")
      .eq("playlist_id", playlistId)
      .eq("track_id", trackId)
      .single();

    if (existingTrack) {
      throw new Error("Track already exists in playlist");
    }

    const { data, error } = await supabase
      .from("playlist_tracks")
      .insert({
        playlist_id: playlistId,
        track_id: trackId
      })
      .select(`
        id, playlist_id, track_id, added_at,
        track:tracks(
          id, title, duration,
          artist:artist_id(id, name),
          album:album_id(id, title, cover_image_url)
        )
      `)
      .single();

    if (error) {
      console.error("Error adding track to playlist:", error);
      throw new Error(`Failed to add track to playlist: ${error.message}`);
    }

    return data as PlaylistTrack;
  }

  /**
   * Xóa track khỏi playlist
   */
  static async removeTrackFromPlaylist(
    playlistId: number,
    trackId: number,
    userId: string
  ): Promise<void> {
    const supabase = createServerComponentClient<Database>({ cookies });

    // Kiểm tra quyền sở hữu playlist
    const { data: playlist } = await supabase
      .from("playlists")
      .select("id")
      .eq("id", playlistId)
      .eq("user_id", userId)
      .single();

    if (!playlist) {
      throw new Error("Playlist not found or access denied");
    }

    const { error } = await supabase
      .from("playlist_tracks")
      .delete()
      .eq("playlist_id", playlistId)
      .eq("track_id", trackId);

    if (error) {
      console.error("Error removing track from playlist:", error);
      throw new Error(`Failed to remove track from playlist: ${error.message}`);
    }
  }

  /**
   * Lấy chi tiết playlist
   */
  static async getPlaylistById(playlistId: number): Promise<Playlist | null> {
    const supabase = createServerComponentClient<Database>({ cookies });

    const { data, error } = await supabase
      .from("playlists")
      .select(`
        id, name, description, cover_image_url, user_id, created_at, updated_at,
        playlist_tracks(count)
      `)
      .eq("id", playlistId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Error fetching playlist:", error);
      throw new Error(`Failed to fetch playlist: ${error.message}`);
    }

    return {
      ...data,
      track_count: data.playlist_tracks?.[0]?.count || 0
    } as Playlist;
  }

  /**
   * Xóa track khỏi playlist
   */
  static async removeTrackFromPlaylist(
    playlistId: number,
    playlistTrackId: number,
    userId: string
  ): Promise<void> {
    const supabase = createServerComponentClient<Database>({ cookies });

    // Verify user owns the playlist
    const { data: playlist, error: playlistError } = await supabase
      .from("playlists")
      .select("user_id")
      .eq("id", playlistId)
      .eq("user_id", userId)
      .single();

    if (playlistError || !playlist) {
      throw new Error("Playlist not found or unauthorized");
    }

    const { error } = await supabase
      .from("playlist_tracks")
      .delete()
      .eq("id", playlistTrackId)
      .eq("playlist_id", playlistId);

    if (error) {
      console.error("Error removing track from playlist:", error);
      throw new Error(`Failed to remove track from playlist: ${error.message}`);
    }
  }
}