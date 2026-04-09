import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { env } from "@/lib/env";
import { AppError } from "@/lib/errors/app-error";
import type { StorageAdapter, StoredFile } from "@/lib/storage/types";

export class LocalStorageAdapter implements StorageAdapter {
  async upload(file: File, namespace: string): Promise<StoredFile> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storageKey = path.posix.join(namespace, `${Date.now()}-${safeName}`);

    if (process.env.VERCEL === "1") {
      return {
        fileUrl: `data:${file.type};base64,${buffer.toString("base64")}`,
        storageKey: `inline/${storageKey}`,
        mimeType: file.type,
        size: file.size,
        width: null,
        height: null
      };
    }

    const fullPath = path.join(process.cwd(), env.LOCAL_UPLOAD_DIR, storageKey);

    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, buffer);

    return {
      fileUrl: `${env.NEXT_PUBLIC_APP_URL}${env.LOCAL_UPLOAD_DIR.replace("./public", "")}/${storageKey}`.replace(/\\/g, "/"),
      storageKey,
      mimeType: file.type,
      size: file.size,
      width: null,
      height: null
    };
  }

  async remove(storageKey: string) {
    if (storageKey.startsWith("inline/")) {
      return;
    }

    const fullPath = path.join(process.cwd(), env.LOCAL_UPLOAD_DIR, storageKey);

    try {
      await unlink(fullPath);
    } catch {
      throw new AppError("Failed to remove local upload", 500, "STORAGE_REMOVE_FAILED");
    }
  }
}
