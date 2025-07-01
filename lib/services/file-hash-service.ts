
import crypto from 'crypto';

export class FileHashService {
  /**
   * Calculate MD5 hash from file buffer
   */
  static calculateMD5(buffer: Buffer): string {
    return crypto.createHash('md5').update(buffer).digest('hex');
  }

  /**
   * Calculate MD5 hash from File object
   */
  static async calculateMD5FromFile(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    return this.calculateMD5(buffer);
  }

  /**
   * Compare two files by their MD5 hash
   */
  static async compareFiles(file1: File, file2: File): Promise<boolean> {
    const hash1 = await this.calculateMD5FromFile(file1);
    const hash2 = await this.calculateMD5FromFile(file2);
    return hash1 === hash2;
  }

  /**
   * Generate unique identifier combining user ID and file hash
   */
  static generateFileIdentifier(userId: string, fileHash: string): string {
    return `${userId}_${fileHash}`;
  }
}
