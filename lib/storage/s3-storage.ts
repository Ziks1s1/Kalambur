import aws4 from "aws4";

import { env } from "@/lib/env";
import { AppError } from "@/lib/errors/app-error";
import type { StorageAdapter, StoredFile } from "@/lib/storage/types";

function getCredentials() {
  if (!env.S3_ACCESS_KEY || !env.S3_SECRET_KEY) {
    throw new AppError("S3 credentials are not configured", 500, "S3_NOT_CONFIGURED");
  }
  return {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY
  };
}

/** Path segments after bucket; slashes in key stay as path separators. */
function encodeS3ObjectKey(key: string): string {
  return key.split("/").map((segment) => encodeURIComponent(segment)).join("/");
}

async function s3SignedRequest(
  method: "PUT" | "DELETE",
  bucket: string,
  objectKey: string,
  body: Buffer | undefined,
  contentType: string | undefined
): Promise<void> {
  const region = env.S3_REGION || "us-east-1";
  const endpoint = env.S3_ENDPOINT;
  const encodedKey = encodeS3ObjectKey(objectKey);

  let host: string;
  let path: string;

  if (endpoint) {
    const u = new URL(endpoint);
    host = u.host;
    path = `/${bucket}/${encodedKey}`;
  } else {
    host = `${bucket}.s3.${region}.amazonaws.com`;
    path = `/${encodedKey}`;
  }

  const headers: Record<string, string> = {};
  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  const signed = aws4.sign(
    {
      host,
      path,
      method,
      body,
      headers,
      service: "s3",
      region
    },
    getCredentials()
  );

  const url = `https://${signed.host}${signed.path}`;
  const requestBody: BodyInit | undefined =
    method === "DELETE" || body === undefined ? undefined : new Uint8Array(body);

  const res = await fetch(url, {
    method: signed.method,
    headers: signed.headers as Record<string, string>,
    body: requestBody
  });

  if (!res.ok) {
    const text = await res.text();
    throw new AppError(`S3 ${method} failed (${res.status}): ${text.slice(0, 400)}`, 502, "S3_REQUEST_FAILED");
  }
}

export class S3StorageAdapter implements StorageAdapter {
  async upload(file: File, namespace: string): Promise<StoredFile> {
    if (!env.S3_BUCKET) {
      throw new AppError("S3 bucket is not configured", 500, "S3_NOT_CONFIGURED");
    }

    const storageKey = `${namespace}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await s3SignedRequest("PUT", env.S3_BUCKET, storageKey, buffer, file.type || "application/octet-stream");

    const fileUrl = env.S3_ENDPOINT
      ? `${env.S3_ENDPOINT.replace(/\/$/, "")}/${env.S3_BUCKET}/${storageKey}`
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

    await s3SignedRequest("DELETE", env.S3_BUCKET, storageKey, undefined, undefined);
  }
}
