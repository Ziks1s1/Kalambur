type TaskAssetsShape =
  | {
      imageUrls?: unknown;
      imageUrl?: unknown;
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

export function buildTaskAssets(imageUrls: string[]) {
  if (imageUrls.length === 0) {
    return null;
  }

  return {
    imageUrls
  };
}
