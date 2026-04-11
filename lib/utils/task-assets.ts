type TaskAssetsShape =
  | {
      imageUrls?: unknown;
      imageUrl?: unknown;
      referenceImageUrls?: unknown;
      referenceImageUrl?: unknown;
    }
  | unknown[];

export function getTaskImageUrls(assetsJson: unknown): string[] {
  if (!assetsJson) {
    return [];
  }

  if (Array.isArray(assetsJson)) {
    return assetsJson.filter((item): item is string => typeof item === "string" && item.length > 0);
  }

  if (typeof assetsJson !== "object") {
    return [];
  }

  const assets = assetsJson as TaskAssetsShape;

  if (!Array.isArray(assets) && Array.isArray(assets.imageUrls)) {
    return assets.imageUrls.filter((item): item is string => typeof item === "string" && item.length > 0);
  }

  if (!Array.isArray(assets) && typeof assets.imageUrl === "string" && assets.imageUrl.length > 0) {
    return [assets.imageUrl];
  }

  return [];
}

export function toAbsoluteImageUrl(value: string, baseUrl: string) {
  if (!value) {
    return value;
  }

  if (value.startsWith("data:")) {
    return value;
  }

  try {
    return new URL(value).toString();
  } catch {
    try {
      return new URL(value, baseUrl).toString();
    } catch {
      return value;
    }
  }
}

export function buildTaskAssets(imageUrls: string[]) {
  if (imageUrls.length === 0) {
    return null;
  }

  return {
    imageUrls
  };
}

export function getReferenceImageUrls(value: unknown): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }

  const record = value as Record<string, unknown>;

  if (Array.isArray(record.referenceImageUrls)) {
    return record.referenceImageUrls.filter((item): item is string => typeof item === "string" && item.length > 0);
  }

  if (typeof record.referenceImageUrl === "string" && record.referenceImageUrl.length > 0) {
    return [record.referenceImageUrl];
  }

  return [];
}
