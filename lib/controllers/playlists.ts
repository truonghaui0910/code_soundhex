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
  del_status?: number;
  private?: boolean;
}

export interface PlaylistTrack {
  id: number;
  title: string;
  file_url?: string;
  audio_file_url?: string;
  duration: number | null;
  created_at: string;
  artist?: {
    id: number;
    name: string;
    profile_image_url?: string;
  } | null;
  album?: {
    id: number;
    title: string;
    cover_image_url?: string;
    release_date?: string;
  } | null;
  genre?: {
    id: number;
    name: string;
  } | null;
}

export class PlaylistsController {
  /**
   * Lấy tất cả playlist của user
   */
  static async getUserPlaylists(userId: string): Promise<Playlist[]> {
    const supabase = createServerComponentClient<Database>({ cookies });

    const { data, error } = await supabase
      .from("playlists" as any)
      .select(
        `
        id, name, description, cover_image_url, user_id, created_at, updated_at, del_status, private,
        playlist_tracks(count)
      `,
      )
      .eq("user_id", userId)
      .eq("del_status", 0)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user playlists:", error);
      throw new Error(`Failed to fetch playlists: ${error.message}`);
    }

    return (data || []).map((playlist: any) => ({
      ...playlist,
      track_count: playlist.playlist_tracks?.[0]?.count || 0,
    }));
  }

  /**
   * Tạo playlist mới
   */
  static async createPlaylist(
    userId: string,
    name: string,
    description?: string,
    coverImageUrl?: string,
    isPrivate?: boolean,
  ): Promise<Playlist> {
    const supabase = createServerComponentClient<Database>({ cookies });

    const { data, error } = await supabase
      .from("playlists" as any)
      .insert({
        name,
        description,
        cover_image_url: coverImageUrl,
        user_id: userId,
        private: isPrivate || false,
        del_status: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating playlist:", error);
      throw new Error(`Failed to create playlist: ${error?.message}`);
    }
    console.log("Data type:", typeof data);
    console.log("Data value:", data);
    console.log("Is array:", Array.isArray(data));
    if (!data) {
      throw new Error("No data returned from playlist creation");
    }

    // Type assertion cho data
    const playlistData = data as any;

    return {
      ...playlistData,
      track_count: 0,
    } as Playlist;
    // return { ...(data || {}), track_count: 0 } as Playlist;
  }

  /**
   * Cập nhật playlist
   */
  static async updatePlaylist(
    playlistId: number,
    userId: string,
    updates: Partial<
      Pick<Playlist, "name" | "description" | "cover_image_url" | "private">
    >,
  ): Promise<Playlist> {
    const supabase = createServerComponentClient<Database>({ cookies });

    const { data, error } = await supabase
      .from("playlists" as any)
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
   * Soft delete playlist (set del_status = 1)
   */
  static async softDeletePlaylist(
    playlistId: number,
    userId: string,
  ): Promise<void> {
    const supabase = createServerComponentClient<Database>({ cookies });

    const { error } = await supabase
      .from("playlists" as any)
      .update({ del_status: 1 })
      .eq("id", playlistId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error soft deleting playlist:", error);
      throw new Error(`Failed to delete playlist: ${error.message}`);
    }
  }

  /**
   * Hard delete playlist (thực sự xóa khỏi database)
   */
  static async deletePlaylist(
    playlistId: number,
    userId: string,
  ): Promise<void> {
    const supabase = createServerComponentClient<Database>({ cookies });

    const { error } = await supabase
      .from("playlists" as any)
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
      .from("playlist_tracks" as any)
      .select(
        `
      position,
      tracks (
        id,
        title,
        file_url,
        audio_file_url,
        duration,
        created_at,
        artists (id, name, profile_image_url),
        albums (id, title, cover_image_url, release_date),
        genres (id, name)
      )
    `,
      )
      .eq("playlist_id", playlistId)
      .order("position");

    if (error) {
      throw new Error(`Failed to fetch playlist tracks: ${error.message}`);
    }

    // Transform the data to match Track interface exactly like in albums/tracks
    const tracks =
      data?.map((item) => {
        const track = item.tracks as any;

        // Ensure we have complete track data structure
        const transformedTrack = {
          id: track.id,
          title: track.title || "Unknown Title",
          file_url: track.file_url,
          audio_file_url: track.audio_file_url,
          duration: track.duration,
          created_at: track.created_at,
          artist: track.artists
            ? {
                id: track.artists.id,
                name: track.artists.name,
                profile_image_url: track.artists.profile_image_url,
              }
            : null,
          album: track.albums
            ? {
                id: track.albums.id,
                title: track.albums.title,
                cover_image_url: track.albums.cover_image_url,
                release_date: track.albums.release_date,
              }
            : null,
          genre: track.genres
            ? {
                id: track.genres.id,
                name: track.genres.name,
              }
            : null,
        };

        return transformedTrack;
      }) || [];

    console.log(
      "Playlist tracks with complete info:",
      tracks.map((t) => ({
        id: t.id,
        title: t.title,
        file_url: t.file_url,
        audio_file_url: t.audio_file_url,
        hasArtist: !!t.artist,
        hasAlbum: !!t.album,
      })),
    );

    return tracks;
  }

  /**
   * Thêm track vào playlist
   */
  static async addTrackToPlaylist(
    playlistId: number,
    trackId: number,
    userId: string,
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

    // Kiểm tra xem playlist có tracks nào chưa
    const { data: playlistTracks } = await supabase
      .from("playlist_tracks")
      .select("id")
      .eq("playlist_id", playlistId);

    const isFirstTrack = !playlistTracks || playlistTracks.length === 0;

    const { data, error } = await supabase
      .from("playlist_tracks")
      .insert({
        playlist_id: playlistId,
        track_id: trackId,
      })
      .select(
        `
        id, playlist_id, track_id, added_at,
        track:tracks(
          id, title, duration,
          artist:artist_id(id, name),
          album:album_id(id, title, cover_image_url)
        )
      `,
      )
      .single();

    if (error) {
      console.error("Error adding track to playlist:", error);
      throw new Error(`Failed to add track to playlist: ${error.message}`);
    }

    // Nếu đây là bài hát đầu tiên trong playlist, cập nhật cover_image_url của playlist
    if (isFirstTrack) {
      const trackData = data as any;
      const albumCoverUrl = trackData.track?.album?.cover_image_url;
      
      if (albumCoverUrl) {
        const { error: updateError } = await supabase
          .from("playlists")
          .update({ cover_image_url: albumCoverUrl })
          .eq("id", playlistId)
          .eq("user_id", userId);

        if (updateError) {
          console.error("Error updating playlist cover image:", updateError);
          // Không throw error ở đây vì track đã được thêm thành công
        } else {
          console.log(`Updated playlist ${playlistId} cover image from first track's album`);
        }
      }
    }

    return data as PlaylistTrack;
  }

  /**
   * Xóa track khỏi playlist
   */
  static async removeTrackFromPlaylist(
    playlistId: number,
    trackId: number,
    userId: string,
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
      .select(
        `
        id, name, description, cover_image_url, user_id, created_at, updated_at, del_status, private,
        playlist_tracks(count)
      `,
      )
      .eq("id", playlistId)
      .eq("del_status", 0)
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
      track_count: data.playlist_tracks?.[0]?.count || 0,
    } as Playlist;
  }

  /**
   * Lấy public playlists (cho tất cả user)
   */
  static async getPublicPlaylists(): Promise<Playlist[]> {
    const supabase = createServerComponentClient<Database>({ cookies });

    const { data, error } = await supabase
      .from("playlists")
      .select(
        `
        id, name, description, cover_image_url, user_id, created_at, updated_at, del_status, private,
        playlist_tracks(count)
      `,
      )
      .eq("del_status", 0)
      .eq("private", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching public playlists:", error);
      throw new Error(`Failed to fetch public playlists: ${error.message}`);
    }

    return (data || []).map((playlist: any) => ({
      ...playlist,
      track_count: playlist.playlist_tracks?.[0]?.count || 0,
    }));
  }

  /**
   * Xóa track khỏi playlist
   */
  static async removeTrackFromPlaylist(
    playlistId: number,
    playlistTrackId: number,
    userId: string,
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
