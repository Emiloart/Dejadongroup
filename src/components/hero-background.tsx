import { ResponsiveHeroImage } from "@/components/responsive-hero-image";
import type { HeroImageAsset } from "@/lib/hero-media";
import type { ImageProps } from "next/image";

type HeroBackgroundProps = {
  image: HeroImageAsset;
  priority?: boolean;
  onLoad?: ImageProps["onLoad"];
  onError?: ImageProps["onError"];
  loading?: ImageProps["loading"];
  fetchPriority?: ImageProps["fetchPriority"];
};

export function HeroBackground({ image, priority = false, ...imageProps }: HeroBackgroundProps) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <ResponsiveHeroImage asset={image} priority={priority} className="object-cover" {...imageProps} />
      <div className="hero-scrim absolute inset-0" />
    </div>
  );
}
