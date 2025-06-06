
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';

type Album = Database['public']['Tables']['albums']['Row'] & {
  artist?: Database['public']['Tables']['artists']['Row'];
};

export class AlbumsController {
  static async getAllAlbums(): Promise<Album[]> {
    try {
      const supabase = createClient();
      
      const { data: albums, error } = await supabase
        .from('albums')
        .select(`
          *,
          artist:artists(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching albums:', error);
        throw new Error('Failed to fetch albums');
      }

      return albums || [];
    } catch (error) {
      console.error('Error in getAllAlbums:', error);
      throw error;
    }
  }

  static async getAlbumById(id: number): Promise<Album | null> {
    try {
      const supabase = createClient();
      
      const { data: album, error } = await supabase
        .from('albums')
        .select(`
          *,
          artist:artists(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Album not found
        }
        console.error('Error fetching album:', error);
        throw new Error('Failed to fetch album');
      }

      return album;
    } catch (error) {
      console.error('Error in getAlbumById:', error);
      throw error;
    }
  }
}
