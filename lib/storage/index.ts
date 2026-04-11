import { env } from "@/lib/env";
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
    const { LocalStorageAdapter } = await import("@/lib/storage/local-storage");
    adapter = new LocalStorageAdapter();
  }

  return adapter;
}
