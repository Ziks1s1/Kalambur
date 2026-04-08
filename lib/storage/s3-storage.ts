import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { env } from "@/lib/env";
import { AppError } from "@/lib/errors/app-error";
import type { StorageAdapter, StoredFile } from "@/lib/storage/types";

export class S3StorageAdapter implements StorageAdapter {
  private readonly client = new S3Client({
    region: env.S3_REGION,
    endpoint: env.S3_ENDPOINT || undefined,
    credentials:
      env.S3_ACCESS_KEY && env.S3_SECRET_KEY
        ? {
            accessKeyId: env.S3_ACCESS_KEY,
            secretAccessKey: env.S3_SECRET_KEY
          }
        : undefined,
    forcePathStyle: Boolean(env.S3_ENDPOINT)
  });

  async upload(file: File, namespace: string): Promise<StoredFile> {
    if (!env.S3_BUCKET) {
      throw new AppError("S3 bucket is not configured", 500, "S3_NOT_CONFIGURED");
    }

    const storageKey = `${namespace}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await this.client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: storageKey,
        Body: buffer,
        ContentType: file.type
      })
    );

    const fileUrl = env.S3_ENDPOINT
      ? `${env.S3_ENDPOINT}/${env.S3_BUCKET}/${storageKey}`
      : `https://${env.S3_BUCKET}.s3.${env.S3_REGION}.amazonaws.com/${storageKey}`;

    return {
      fileUrl,
      storageKey,
      mimeType: file.type,
      size: file.size,
      width: null,
      height: null
    };
  }

  async remove(storageKey: string) {
    if (!env.S3_BUCKET) {
      throw new AppError("S3 bucket is not configured", 500, "S3_NOT_CONFIGURED");
    }

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: storageKey
      })
    );
  }
}
