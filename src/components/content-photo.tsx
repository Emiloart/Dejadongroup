import { ResponsiveHeroImage } from "@/components/responsive-hero-image";
import { contentPhotos, type ContentPhotoName } from "@/lib/content-media";

export function ContentPhoto({ name, className = "", imageClassName = "", aspectRatio, sizes = "(min-width: 1024px) 50vw, 100vw" }: {
  name: ContentPhotoName;
  className?: string;
  imageClassName?: string;
  aspectRatio?: number;
  sizes?: string;
}) {
  const photo = contentPhotos[name];
  return <div className={`relative overflow-hidden rounded-card bg-ink/5 ${className}`} style={{ aspectRatio: aspectRatio ?? photo.image.full.width / photo.image.full.height }}>
    <ResponsiveHeroImage asset={photo.image} alt={photo.alt} sizes={sizes} className={`object-cover ${imageClassName}`} />
  </div>;
}
