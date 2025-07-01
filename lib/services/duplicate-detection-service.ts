
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { FileHashService } from "./file-hash-service";

export interface DuplicateInfo {
  exists: boolean;
  trackId?: number;
  title?: string;
  artist?: string;
  fileHash?: string;
}

export class DuplicateDetectionService {
  private static supabase = createClientComponentClient<Database>();

  /**
   * Check if file already exists for current user
   */
  static async checkDuplicate(file: File, userId: string): Promise<DuplicateInfo> {
    try {
      const fileHash = await FileHashService.calculateMD5FromFile(file);
      
      const { data: existingTrack, error } = await this.supabase
        .from("tracks")
        .select(`
          id, 
          title, 
          file_hash,
          artist:artist_id(name)
        `)
        .eq("user_id", userId)
        .eq("file_hash", fileHash)
        .single();

      if (existingTrack) {
        return {
          exists: true,
          trackId: existingTrack.id,
          title: existingTrack.title,
          artist: existingTrack.artist?.name || "Unknown",
          fileHash: fileHash
        };
      }

      return { exists: false, fileHash };
    } catch (error) {
      console.error("Error checking duplicate:", error);
      return { exists: false };
    }
  }

  /**
   * Get all duplicate files for a user
   */
  static async getUserDuplicates(userId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from("tracks")
        .select(`
          id,
          title,
          file_hash,
          created_at,
          artist:artist_id(name)
        `)
        .eq("user_id", userId)
        .not("file_hash", "is", null)
        .order("file_hash");

      if (error) throw error;

      // Group by file_hash to find duplicates
      const hashGroups: Record<string, any[]> = {};
      data?.forEach(track => {
        if (!hashGroups[track.file_hash]) {
          hashGroups[track.file_hash] = [];
        }
        hashGroups[track.file_hash].push(track);
      });

      // Return only groups with more than 1 track
      return Object.values(hashGroups).filter(group => group.length > 1);
    } catch (error) {
      console.error("Error getting user duplicates:", error);
      return [];
    }
  }
}
