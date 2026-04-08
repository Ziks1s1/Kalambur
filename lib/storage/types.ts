export type StoredFile = {
  fileUrl: string;
  storageKey: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
};

export interface StorageAdapter {
  upload(file: File, namespace: string): Promise<StoredFile>;
  remove(storageKey: string): Promise<void>;
}
