
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class AWSHelper {
  private static s3Client: S3Client | null = null;
  private static accountId = "f9c3a8281b5ed069e736fa2108f6f106";
  private static bucket = process.env.AWS_BUCKET || "your-bucket-name";
  private static region = process.env.AWS_DEFAULT_REGION || "auto";

  private static getS3Client(): S3Client {
    if (this.s3Client === null) {
      this.s3Client = new S3Client({
        endpoint: `https://${this.accountId}.r2.cloudflarestorage.com`,
        region: this.region,
        credentials: {
          accessKeyId: "5bfdf2d1865b988d393b7e5fc33ab2e4",
          secretAccessKey: "697bcb379abb325b9dec6926ce22250dcd17f6b8ea2afdca2a32993a0dcb8276",
        },
      });
    }
    return this.s3Client;
  }

  public static async getUploadImageLink(
    filename: string, 
    folder: string = 'albums'
  ): Promise<[string, string]> {
    try {
      const s3 = this.getS3Client();
      const key = `${folder}/${filename}`;

      // Create presigned URL for PUT upload
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour

      // Public URL
      const newUrl = `https://storage.automusic.win/${key}`;

      return [presignedUrl, newUrl];
    } catch (error) {
      console.error('AWS S3 Error:', error);
      throw new Error('Failed to generate upload link');
    }
  }

  public static async uploadFile(
    file: Buffer, 
    filename: string, 
    folder: string = 'albums'
  ): Promise<string> {
    try {
      const s3 = this.getS3Client();
      const key = `${folder}/${filename}`;

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
      });

      await s3.send(command);

      return `https://storage.automusic.win/${key}`;
    } catch (error) {
      console.error('AWS S3 Upload Error:', error);
      throw new Error('Failed to upload file');
    }
  }

  public static async deleteFile(
    fileUrl: string, 
    folder: string = 'albums'
  ): Promise<boolean> {
    try {
      const s3 = this.getS3Client();
      
      // Extract filename from URL
      const filename = fileUrl.split('/').pop() || '';
      const key = `${folder}/${filename}`;

      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await s3.send(command);
      return true;
    } catch (error) {
      console.error('AWS S3 Delete Error:', error);
      return false;
    }
  }

  public static async fileExists(
    fileUrl: string, 
    folder: string = 'albums'
  ): Promise<boolean> {
    try {
      const s3 = this.getS3Client();
      
      const filename = fileUrl.split('/').pop() || '';
      const key = `${folder}/${filename}`;

      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await s3.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }
}
