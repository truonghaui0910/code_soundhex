
export interface UploadOptions {
  folder?: string;
  fileType?: string;
}

export interface UploadResult {
  success: boolean;
  publicUrl?: string;
  error?: string;
}

export class FileUploadService {
  /**
   * Upload file using presigned URL
   */
  static async uploadFile(
    file: File,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      // Step 1: Get presigned URL
      const response = await fetch('/api/upload/presigned-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          folder: options.folder || 'uploads',
          fileType: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { presignedUrl, publicUrl } = await response.json();

      // Step 2: Upload file directly to S3 using presigned URL
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      return {
        success: true,
        publicUrl,
      };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Upload image with validation
   */
  static async uploadImage(
    file: File,
    options: UploadOptions & { 
      maxSize?: number; 
      dimensions?: { width: number; height: number } 
    } = {}
  ): Promise<UploadResult> {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'File must be an image',
      };
    }

    // Validate file size (default 5MB)
    const maxSize = options.maxSize || 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        success: false,
        error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
      };
    }

    // Validate dimensions if specified
    if (options.dimensions) {
      const isValidDimensions = await this.validateImageDimensions(
        file,
        options.dimensions
      );
      if (!isValidDimensions) {
        return {
          success: false,
          error: `Image must be ${options.dimensions.width}x${options.dimensions.height}px`,
        };
      }
    }

    return this.uploadFile(file, {
      ...options,
      folder: options.folder || 'images',
    });
  }

  /**
   * Upload audio file with validation
   */
  static async uploadAudio(
    file: File,
    options: UploadOptions & { maxSize?: number } = {}
  ): Promise<UploadResult> {
    // Validate file type
    if (!file.type.startsWith('audio/')) {
      return {
        success: false,
        error: 'File must be an audio file',
      };
    }

    // Validate file size (default 50MB)
    const maxSize = options.maxSize || 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        success: false,
        error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
      };
    }

    return this.uploadFile(file, {
      ...options,
      folder: options.folder || 'tracks',
    });
  }

  /**
   * Validate image dimensions
   */
  private static validateImageDimensions(
    file: File,
    requiredDimensions: { width: number; height: number }
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const isValid = 
          img.width === requiredDimensions.width && 
          img.height === requiredDimensions.height;
        resolve(isValid);
      };
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Get file preview URL
   */
  static getFilePreview(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Cleanup preview URL
   */
  static cleanupPreview(url: string): void {
    URL.revokeObjectURL(url);
  }
}
