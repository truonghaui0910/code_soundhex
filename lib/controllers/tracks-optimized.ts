import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Track } from "@/lib/definitions/Track";
import { Database } from "@/types/supabase";

/**
 * Optimized controller cho tracks với focus vào performance
 */
export class TracksOptimizedController {
  /**
   * Lấy danh sách bài hát được xem nhiều nhất
   */
  static async getMostViewedTracks(limit: number = 12): Promise<Track[]> {
    console.log(`🎵 TracksOptimizedController.getMostViewedTracks - Starting fetch with limit: ${limit}`);
    const supabase = createServerComponentClient<Database>({ cookies });

    const { data, error } = await supabase
      .from("tracks")
      .select(`
        *, view_count,
        artist:artist_id(id, name, profile_image_url, custom_url),
        album:album_id(id, title, cover_image_url, custom_url),
        genre:genre_id(id, name)
      `)
      .order("view_count", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching most viewed tracks:", error);
      throw new Error(`Failed to fetch most viewed tracks: ${error.message}`);
    }

    console.log(`✅ TracksOptimizedController.getMostViewedTracks - Found ${data?.length || 0} tracks`);
    return data as unknown as Track[];
  }
} 