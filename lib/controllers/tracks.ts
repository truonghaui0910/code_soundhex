import { createClient } from '@/lib/supabase/client';
import { Track } from "@/lib/definitions/Track";
import { Database } from "@/types/supabase";

type TrackWithDetails = Database['public']['Tables']['tracks']['Row'] & {
  artist?: Database['public']['Tables']['artists']['Row'];
  album?: Database['public']['Tables']['albums']['Row'];
  genre?: Database['public']['Tables']['genres']['Row'];
};

export class TracksController {
  static async getAllTracks(): Promise<TrackWithDetails[]> {
    try {
      const supabase = createClient();

      const { data: tracks, error } = await supabase
        .from('tracks')
        .select(`
          *,
          artist:artists(*),
          album:albums(*),
          genre:genres(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tracks:', error);
        throw new Error('Failed to fetch tracks');
      }

      return tracks || [];
    } catch (error) {
      console.error('Error in getAllTracks:', error);
      throw error;
    }
  }

  static async getTracksByAlbum(albumId: number): Promise<TrackWithDetails[]> {
    try {
      const supabase = createClient();

      const { data: tracks, error } = await supabase
        .from('tracks')
        .select(`
          *,
          artist:artists(*),
          album:albums(*),
          genre:genres(*)
        `)
        .eq('album_id', albumId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tracks by album:', error);
        throw new Error('Failed to fetch tracks');
      }

      return tracks || [];
    } catch (error) {
      console.error('Error in getTracksByAlbum:', error);
      throw error;
    }
  }

  static async getTrackById(id: number): Promise<TrackWithDetails | null> {
    try {
      const supabase = createClient();

      const { data: track, error } = await supabase
        .from('tracks')
        .select(`
          *,
          artist:artists(*),
          album:albums(*),
          genre:genres(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Track not found
        }
        console.error('Error fetching track:', error);
        throw new Error('Failed to fetch track');
      }

      return track;
    } catch (error) {
      console.error('Error in getTrackById:', error);
      throw error;
    }
  }
}