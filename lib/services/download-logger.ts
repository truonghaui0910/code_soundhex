
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

export class DownloadLogger {
  private static async getSupabaseClient() {
    return createServerComponentClient<Database>({ cookies });
  }

  /**
   * Validate IP address format
   */
  private static isValidIP(ip: string): boolean {
    // IPv4 regex
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    // IPv6 regex (simplified)
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  /**
   * Log a download activity
   */
  static async logDownload({
    trackId,
    userId,
    ipAddress,
    userAgent,
    downloadType = 'single',
    fileSizeBytes,
    success = true,
    errorMessage
  }: {
    trackId: number;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    downloadType?: 'single' | 'batch' | 'album';
    fileSizeBytes?: number;
    success?: boolean;
    errorMessage?: string;
  }) {
    try {
      const supabase = await this.getSupabaseClient();
      
      // Validate and clean IP address
      let cleanIpAddress = null;
      if (ipAddress && ipAddress !== 'unknown') {
        // Take only the first IP if multiple IPs are present
        const cleanIp = ipAddress.split(',')[0].trim();
        // Basic IP validation (IPv4 or IPv6)
        if (this.isValidIP(cleanIp)) {
          cleanIpAddress = cleanIp;
        }
      }
      
      const { data, error } = await supabase
        .from('track_downloads')
        .insert({
          track_id: trackId,
          user_id: userId || null,
          ip_address: cleanIpAddress,
          user_agent: userAgent || null,
          download_type: downloadType,
          file_size_bytes: fileSizeBytes || null,
          success,
          error_message: errorMessage || null
        });

      if (error) {
        console.error('Error logging download:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error logging download:', error);
      return false;
    }
  }

  /**
   * Log multiple downloads (for batch downloads)
   */
  static async logBatchDownload({
    trackIds,
    userId,
    ipAddress,
    userAgent,
    downloadType = 'batch',
    success = true,
    errorMessage
  }: {
    trackIds: number[];
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    downloadType?: 'single' | 'batch' | 'album';
    success?: boolean;
    errorMessage?: string;
  }) {
    try {
      const supabase = await this.getSupabaseClient();
      
      // Validate and clean IP address
      let cleanIpAddress = null;
      if (ipAddress && ipAddress !== 'unknown') {
        // Take only the first IP if multiple IPs are present
        const cleanIp = ipAddress.split(',')[0].trim();
        // Basic IP validation (IPv4 or IPv6)
        if (this.isValidIP(cleanIp)) {
          cleanIpAddress = cleanIp;
        }
      }
      
      const downloadLogs = trackIds.map(trackId => ({
        track_id: trackId,
        user_id: userId || null,
        ip_address: cleanIpAddress,
        user_agent: userAgent || null,
        download_type: downloadType,
        success,
        error_message: errorMessage || null
      }));

      const { data, error } = await supabase
        .from('track_downloads')
        .insert(downloadLogs);

      if (error) {
        console.error('Error logging batch download:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error logging batch download:', error);
      return false;
    }
  }

  /**
   * Get download statistics for a track
   */
  static async getTrackDownloadStats(trackId: number) {
    try {
      const supabase = await this.getSupabaseClient();
      
      const { data, error } = await supabase
        .from('track_downloads')
        .select('*')
        .eq('track_id', trackId)
        .eq('success', true);

      if (error) {
        console.error('Error getting download stats:', error);
        return {
          totalDownloads: 0,
          uniqueDownloaders: 0,
          lastDownload: null
        };
      }

      const uniqueUsers = new Set(data.map(d => d.user_id).filter(Boolean));
      const lastDownload = data.length > 0 ? 
        new Date(Math.max(...data.map(d => new Date(d.downloaded_at).getTime()))) : 
        null;

      return {
        totalDownloads: data.length,
        uniqueDownloaders: uniqueUsers.size,
        lastDownload
      };
    } catch (error) {
      console.error('Error getting download stats:', error);
      return {
        totalDownloads: 0,
        uniqueDownloaders: 0,
        lastDownload: null
      };
    }
  }

  /**
   * Get user's download history
   */
  static async getUserDownloadHistory(userId: string, limit = 50) {
    try {
      const supabase = await this.getSupabaseClient();
      
      const { data, error } = await supabase
        .from('track_downloads')
        .select(`
          *,
          track:track_id (
            id,
            title,
            artist:artist_id (id, name),
            album:album_id (id, title)
          )
        `)
        .eq('user_id', userId)
        .order('downloaded_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting user download history:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Error getting user download history:', error);
      return [];
    }
  }

  /**
   * Get download statistics for admin dashboard
   */
  static async getDownloadStatistics() {
    try {
      const supabase = await this.getSupabaseClient();
      
      // Get total downloads
      const { count: totalDownloads } = await supabase
        .from('track_downloads')
        .select('*', { count: 'exact', head: true })
        .eq('success', true);

      // Get downloads today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: downloadsToday } = await supabase
        .from('track_downloads')
        .select('*', { count: 'exact', head: true })
        .eq('success', true)
        .gte('downloaded_at', today.toISOString());

      // Get most downloaded tracks
      const { data: mostDownloaded } = await supabase
        .from('track_download_stats')
        .select('*')
        .order('download_count', { ascending: false })
        .limit(10);

      return {
        totalDownloads: totalDownloads || 0,
        downloadsToday: downloadsToday || 0,
        mostDownloaded: mostDownloaded || []
      };
    } catch (error) {
      console.error('Error getting download statistics:', error);
      return {
        totalDownloads: 0,
        downloadsToday: 0,
        mostDownloaded: []
      };
    }
  }
}
