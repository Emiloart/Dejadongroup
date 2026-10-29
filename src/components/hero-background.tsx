import { ResponsiveHeroImage } from "@/components/responsive-hero-image";
import type { HeroImageAsset } from "@/lib/hero-media";

type HeroBackgroundProps = { image: HeroImageAsset; priority?: boolean };

export function HeroBackground({ image, priority = false }: HeroBackgroundProps) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <ResponsiveHeroImage asset={image} priority={priority} className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/75 to-ink/60 lg:to-ink/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
    </div>
  );
}
