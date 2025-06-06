
import { Track } from "@/lib/definitions/Track";

export class DownloadService {
  /**
   * Download a track file to user's device
   */
  static async downloadTrack(track: Track): Promise<void> {
    try {
      let response: Response;
      
      try {
        // Try direct fetch first
        response = await fetch(track.file_url);
      } catch (corsError) {
        // If CORS blocked, use proxy
        const proxyUrl = `/api/proxy-audio?url=${encodeURIComponent(track.file_url)}`;
        response = await fetch(proxyUrl);
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch track: ${response.statusText}`);
      }

      // Get the blob data
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element for download
      const link = document.createElement('a');
      link.href = url;
      
      // Extract file extension from URL or default to mp3
      const fileExtension = this.getFileExtension(track.file_url) || 'mp3';
      
      // Set download filename
      link.download = `${track.artist.name} - ${track.title}.${fileExtension}`;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the temporary URL
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Download failed:', error);
      
      // Fallback: open in new tab if CORS blocked
      if (error instanceof TypeError && error.message.includes('CORS')) {
        window.open(track.file_url, '_blank');
        return;
      }
      
      throw new Error('Failed to download track. Please try again.');
    }
  }

  /**
   * Download multiple tracks as a zip file
   */
  static async downloadMultipleTracks(tracks: Track[]): Promise<void> {
    try {
      // For multiple tracks, download them one by one
      // In a real implementation, you might want to create a zip file
      for (const track of tracks) {
        await this.downloadTrack(track);
        // Add a small delay between downloads to avoid overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Batch download failed:', error);
      throw new Error('Failed to download tracks. Please try again.');
    }
  }

  /**
   * Extract file extension from URL
   */
  private static getFileExtension(url: string): string | null {
    try {
      const pathname = new URL(url).pathname;
      const extension = pathname.split('.').pop();
      return extension && extension.length <= 4 ? extension : null;
    } catch {
      return null;
    }
  }

  /**
   * Check if download is supported in current browser
   */
  static isDownloadSupported(): boolean {
    return typeof window !== 'undefined' && 'URL' in window && 'createObjectURL' in window.URL;
  }

  /**
   * Get download size estimate (optional)
   */
  static async getTrackSize(track: Track): Promise<number | null> {
    try {
      const response = await fetch(track.file_url, { method: 'HEAD' });
      const contentLength = response.headers.get('content-length');
      return contentLength ? parseInt(contentLength, 10) : null;
    } catch {
      return null;
    }
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}
