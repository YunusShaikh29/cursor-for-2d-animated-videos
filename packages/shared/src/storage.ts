import { Client as MinioClient } from 'minio';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs';

interface StorageConfig {
  provider: 'minio' | 's3';
  bucketName: string;
  minio?: {
    endpoint: string;
    port: number;
    accessKey: string;
    secretKey: string;
    useSSL: boolean;
  };
  s3?: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
}

export class UnifiedStorageClient {
  private config: StorageConfig;
  private minioClient?: MinioClient;
  private s3Client?: S3Client;

  constructor() {
    const provider = (process.env.STORAGE_PROVIDER as 'minio' | 's3') || 'minio';
    const bucketName = process.env.BUCKET_NAME || 'video-assets';

    this.config = {
      provider,
      bucketName,
    };

    if (provider === 'minio') {
      this.config.minio = {
        endpoint: process.env.MINIO_ENDPOINT || '127.0.0.1',
        port: Number(process.env.MINIO_PORT) || 9000,
        accessKey: process.env.MINIO_ROOT_USER || 'minioadmin',
        secretKey: process.env.MINIO_ROOT_PASSWORD || 'minioadmin123',
        useSSL: false,
      };

      this.minioClient = new MinioClient({
        endPoint: this.config.minio.endpoint,
        port: this.config.minio.port,
        useSSL: this.config.minio.useSSL,
        accessKey: this.config.minio.accessKey,
        secretKey: this.config.minio.secretKey,
      });
    } else {
      this.config.s3 = {
        region: process.env.AWS_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      };

      this.s3Client = new S3Client({
        region: this.config.s3.region,
        credentials: {
          accessKeyId: this.config.s3.accessKeyId,
          secretAccessKey: this.config.s3.secretAccessKey,
        },
      });
    }
  }

  async uploadFile(fileName: string, filePath: string): Promise<string> {
    if (this.config.provider === 'minio' && this.minioClient) {
      await this.minioClient.fPutObject(this.config.bucketName, fileName, filePath);
      console.log(`Uploaded to MinIO: ${fileName}`);
      
      // Return presigned URL for MinIO
      const presignedUrl = await this.minioClient.presignedGetObject(
        this.config.bucketName,
        fileName,
        604800 // 7 days
      );
      return presignedUrl;
    } else if (this.config.provider === 's3' && this.s3Client) {
      const fileContent = fs.readFileSync(filePath);
      
      const command = new PutObjectCommand({
        Bucket: this.config.bucketName,
        Key: fileName,
        Body: fileContent,
        ContentType: 'video/mp4',
      });

      await this.s3Client.send(command);
      console.log(`Uploaded to S3: ${fileName}`);
      
      // Return public URL for S3 (since we made buckets public)
      return `https://${this.config.bucketName}.s3.${this.config.s3!.region}.amazonaws.com/${fileName}`;
    }

    throw new Error('Storage client not properly configured');
  }

  async getFileUrl(fileName: string, expiryInSeconds = 604800): Promise<string> {
    if (this.config.provider === 'minio' && this.minioClient) {
      return await this.minioClient.presignedGetObject(
        this.config.bucketName,
        fileName,
        expiryInSeconds
      );
    } else if (this.config.provider === 's3' && this.s3Client) {
      // For public S3 buckets, return direct URL
      return `https://${this.config.bucketName}.s3.${this.config.s3!.region}.amazonaws.com/${fileName}`;
    }

    throw new Error('Storage client not properly configured');
  }

  /**
   * Delete a single file from storage
   * @param fileName - The name/key of the file to delete
   * @returns Promise<boolean> - true if successful, false if failed
   */
  async deleteFile(fileName: string): Promise<boolean> {
    try {
      if (this.config.provider === 'minio' && this.minioClient) {
        await this.minioClient.removeObject(this.config.bucketName, fileName);
        console.log(`Deleted from MinIO: ${fileName}`);
        return true;
      } else if (this.config.provider === 's3' && this.s3Client) {
        const command = new DeleteObjectCommand({
          Bucket: this.config.bucketName,
          Key: fileName,
        });
        
        await this.s3Client.send(command);
        console.log(`Deleted from S3: ${fileName}`);
        return true;
      }
      
      throw new Error('Storage client not properly configured');
    } catch (error) {
      console.error(`Failed to delete file ${fileName}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple files from storage
   * @param fileNames - Array of file names/keys to delete
   * @returns Promise<{success: string[], failed: string[]}> - Results of deletion attempts
   */
  async deleteFiles(fileNames: string[]): Promise<{success: string[], failed: string[]}> {
    const results = {
      success: [] as string[],
      failed: [] as string[]
    };

    // Process deletions in parallel for better performance
    const deletePromises = fileNames.map(async (fileName) => {
      const success = await this.deleteFile(fileName);
      if (success) {
        results.success.push(fileName);
      } else {
        results.failed.push(fileName);
      }
    });

    await Promise.all(deletePromises);
    return results;
  }

  /**
   * Extract file name from a full URL (works for both MinIO and S3)
   * @param url - Full URL to the file
   * @returns string - Extracted file name/key
   */
  extractFileNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // Remove leading slash and bucket name prefix if present
      let fileName = urlObj.pathname;
      
      // For MinIO URLs, remove the bucket name prefix (e.g., /video-assets/)
      if (this.config.provider === 'minio') {
        fileName = fileName.replace(new RegExp(`^/${this.config.bucketName}/`), '');
      }
      
      // For S3 URLs, the pathname is already just the key
      if (this.config.provider === 's3') {
        fileName = fileName.startsWith('/') ? fileName.substring(1) : fileName;
      }
      
      return fileName;
    } catch (error) {
      console.error('Failed to extract filename from URL:', url, error);
      throw new Error(`Invalid URL format: ${url}`);
    }
  }

  /**
   * Delete files by their full URLs (convenience method for your use case)
   * @param urls - Array of full URLs to delete
   * @returns Promise<{success: string[], failed: string[]}> - Results with original URLs
   */
  async deleteFilesByUrls(urls: string[]): Promise<{success: string[], failed: string[]}> {
    const results = {
      success: [] as string[],
      failed: [] as string[]
    };

    const deletePromises = urls.map(async (url) => {
      try {
        const fileName = this.extractFileNameFromUrl(url);
        const success = await this.deleteFile(fileName);
        if (success) {
          results.success.push(url);
        } else {
          results.failed.push(url);
        }
      } catch (error) {
        console.error(`Failed to process URL ${url}:`, error);
        results.failed.push(url);
      }
    });

    await Promise.all(deletePromises);
    return results;
  }

  getBucketName(): string {
    return this.config.bucketName;
  }

  getProvider(): string {
    return this.config.provider;
  }
}

// Export a singleton instance
export const storageClient = new UnifiedStorageClient();