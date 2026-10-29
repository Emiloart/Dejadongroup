"use client";

import Image, { type ImageProps } from "next/image";
import { heroImageSource, type HeroImageAsset } from "@/lib/hero-media";

export function ResponsiveHeroImage({ asset, alt = "", priority = false, sizes = "100vw", className = "", onLoad, onError, loading, fetchPriority }: {
  asset: HeroImageAsset;
  alt?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  onLoad?: ImageProps["onLoad"];
  onError?: ImageProps["onError"];
  loading?: ImageProps["loading"];
  fetchPriority?: ImageProps["fetchPriority"];
}) {
  return <Image src={asset.full} loader={({ width }) => heroImageSource(asset, width)} alt={alt} fill priority={priority} placeholder="blur" sizes={sizes} className={className} onLoad={onLoad} onError={onError} loading={loading} fetchPriority={fetchPriority} />;
}
