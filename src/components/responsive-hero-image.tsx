"use client";

import Image from "next/image";
import { heroImageSource, type HeroImageAsset } from "@/lib/hero-media";

export function ResponsiveHeroImage({ asset, alt = "", priority = false, sizes = "100vw", className = "" }: {
  asset: HeroImageAsset;
  alt?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  return <Image src={asset.full} loader={({ width }) => heroImageSource(asset, width)} alt={alt} fill priority={priority} placeholder="blur" sizes={sizes} className={className} />;
}
