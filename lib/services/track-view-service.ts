
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

export class TrackViewService {
  private static supabase = createClientComponentClient<Database>();
  private static viewThreshold = 15; // Minimum seconds to count as a view
  private static sessionViews = new Set<string>(); // Track views in current session

  /**
   * Record a track view
   * @param trackId - ID of the track being played
   * @param viewDuration - How long the track was played (in seconds)
   * @param sessionId - Unique session identifier
   */
  static async recordView(
    trackId: number,
    viewDuration: number = 0,
    sessionId?: string
  ): Promise<boolean> {
    try {
      // Don't count very short plays
      if (viewDuration < this.viewThreshold) {
        return false;
      }

      // Generate session ID if not provided
      if (!sessionId) {
        sessionId = this.generateSessionId(trackId);
      }

      // Check if already viewed in this session
      const sessionKey = `${trackId}-${sessionId}`;
      if (this.sessionViews.has(sessionKey)) {
        return false;
      }

      // Get current user
      const { data: { user } } = await this.supabase.auth.getUser();

      // Get client IP (in real app, this would come from server)
      const ipAddress = await this.getClientIP();

      // Record the view
      const { data, error } = await this.supabase
        .from("track_views")
        .insert({
          track_id: trackId,
          user_id: user?.id || null,
          ip_address: ipAddress,
          user_agent: navigator.userAgent,
          view_duration: viewDuration,
          session_id: sessionId,
        })
        .select()
        .single();

      if (error) {
        // If unique constraint violation, it means already viewed in this session
        if (error.code === '23505') {
          return false;
        }
        console.error("Error recording track view:", error);
        return false;
      }

      // Mark as viewed in current session
      this.sessionViews.add(sessionKey);
      return true;

    } catch (error) {
      console.error("Error in recordView:", error);
      return false;
    }
  }

  /**
   * Get view count for a track
   */
  static async getTrackViewCount(trackId: number): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from("tracks")
        .select("view_count")
        .eq("id", trackId)
        .single();

      if (error) {
        console.error("Error getting track view count:", error);
        return 0;
      }

      return data?.view_count || 0;
    } catch (error) {
      console.error("Error in getTrackViewCount:", error);
      return 0;
    }
  }

  /**
   * Get view analytics for a track
   */
  static async getTrackAnalytics(trackId: number, days: number = 30) {
    try {
      const { data, error } = await this.supabase
        .from("track_views")
        .select("viewed_at, view_duration, user_id")
        .eq("track_id", trackId)
        .gte("viewed_at", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order("viewed_at", { ascending: false });

      if (error) {
        console.error("Error getting track analytics:", error);
        return null;
      }

      return {
        totalViews: data.length,
        uniqueUsers: new Set(data.map(v => v.user_id).filter(Boolean)).size,
        averageDuration: data.reduce((sum, v) => sum + (v.view_duration || 0), 0) / data.length,
        viewsData: data,
      };
    } catch (error) {
      console.error("Error in getTrackAnalytics:", error);
      return null;
    }
  }

  /**
   * Get most viewed tracks
   */
  static async getMostViewedTracks(limit: number = 10) {
    try {
      const { data, error } = await this.supabase
        .from("tracks")
        .select(`
          id, title, view_count,
          artist:artist_id(id, name, profile_image_url),
          album:album_id(id, title, cover_image_url)
        `)
        .order("view_count", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error getting most viewed tracks:", error);
        return [];
      }

      return data;
    } catch (error) {
      console.error("Error in getMostViewedTracks:", error);
      return [];
    }
  }

  /**
   * Generate a session-based ID for view tracking
   */
  private static generateSessionId(trackId: number): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `${timestamp}-${random}-${trackId}`;
  }

  /**
   * Get client IP address (simplified version)
   */
  private static async getClientIP(): Promise<string> {
    try {
      // In a real application, you'd get this from the server
      // For now, we'll use a placeholder
      return "0.0.0.0";
    } catch {
      return "0.0.0.0";
    }
  }

  /**
   * Clear session views (call when user changes session)
   */
  static clearSessionViews(): void {
    this.sessionViews.clear();
  }
}
