import { readdirSync } from "node:fs";
import path from "node:path";

export const galleryCategories = ["agriculture", "agro-real-estate"] as const;
export type GalleryCategory = (typeof galleryCategories)[number];

export type GalleryImage = {
  src: string;
  alt: string;
  category: GalleryCategory;
  filename: string;
};

const imageExtensions = new Set([".avif", ".jpeg", ".jpg", ".png", ".webp"]);

function imageFiles(directory: string) {
  try {
    return readdirSync(directory, { withFileTypes: true })
      .filter((entry) => entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase()))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return [];
    throw error;
  }
}

function imageTitle(filename: string) {
  return path.basename(filename, path.extname(filename))
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getGalleryImages(category?: GalleryCategory): GalleryImage[] {
  const categories = category ? [category] : galleryCategories;
  return categories.flatMap((item) => imageFiles(path.join(process.cwd(), "public", "images", "gallery", item))
    .map((filename) => ({
      src: `/images/gallery/${item}/${encodeURIComponent(filename)}`,
      alt: imageTitle(filename),
      category: item,
      filename
    })));
}

export function getMarketplaceImage(slug: string) {
  const filename = imageFiles(path.join(process.cwd(), "public", "images", "marketplace"))
    .find((file) => path.basename(file, path.extname(file)).toLowerCase() === slug);
  return filename ? `/images/marketplace/${encodeURIComponent(filename)}` : null;
}
