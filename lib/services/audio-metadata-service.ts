
import { parseBuffer } from 'music-metadata';

export interface AudioMetadata {
  duration: number; // in seconds
  title?: string;
  artist?: string;
  album?: string;
  genre?: string[];
  year?: number;
}

export class AudioMetadataService {
  /**
   * Extract metadata from audio file buffer
   */
  static async extractMetadata(audioBuffer: Buffer): Promise<AudioMetadata> {
    try {
      const metadata = await parseBuffer(audioBuffer);
      
      return {
        duration: Math.round(metadata.format.duration || 0),
        title: metadata.common.title,
        artist: metadata.common.artist,
        album: metadata.common.album,
        genre: metadata.common.genre,
        year: metadata.common.year,
      };
    } catch (error) {
      console.error('Error extracting audio metadata:', error);
      throw new Error('Failed to extract audio metadata');
    }
  }

  /**
   * Get duration from audio file buffer
   */
  static async getDuration(audioBuffer: Buffer): Promise<number> {
    try {
      const metadata = await this.extractMetadata(audioBuffer);
      return metadata.duration;
    } catch (error) {
      console.error('Error getting audio duration:', error);
      return 0; // Return 0 if unable to get duration
    }
  }

  /**
   * Get duration from audio file (alias for getDuration)
   */
  static async getAudioDuration(audioFile: File): Promise<number> {
    try {
      const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
      return await this.getDuration(audioBuffer);
    } catch (error) {
      console.error('Error getting audio duration:', error);
      return 0; // Return 0 if unable to get duration
    }
  }

  /**
   * Format duration in MM:SS format
   */
  static formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Validate audio file format
   */
  static isValidAudioFile(filename: string): boolean {
    const validExtensions = ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a'];
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return validExtensions.includes(ext);
  }
}
