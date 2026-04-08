import { AppError } from "@/lib/errors/app-error";
import { getStorageAdapter } from "@/lib/storage";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export class UploadService {
  async uploadAttemptFiles(files: File[], namespace: string) {
    if (files.length === 0) {
      throw new AppError("At least one file is required", 400, "FILES_REQUIRED");
    }

    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        throw new AppError(`Unsupported file type: ${file.type}`, 400, "FILE_TYPE_INVALID");
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new AppError("File size exceeds 10MB limit", 400, "FILE_TOO_LARGE");
      }
    }

    return Promise.all(files.map((file) => getStorageAdapter().upload(file, namespace)));
  }
}

export const uploadService = new UploadService();
