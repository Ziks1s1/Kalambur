import { env } from "@/lib/env";
import { LocalStorageAdapter } from "@/lib/storage/local-storage";
import type { StorageAdapter } from "@/lib/storage/types";

let adapter: StorageAdapter | null = null;

export async function getStorageAdapter(): Promise<StorageAdapter> {
  if (adapter) {
    return adapter;
  }

  if (env.STORAGE_MODE === "s3") {
    const { S3StorageAdapter } = await import("@/lib/storage/s3-storage");
    adapter = new S3StorageAdapter();
  } else {
    adapter = new LocalStorageAdapter();
  }

  return adapter;
}
