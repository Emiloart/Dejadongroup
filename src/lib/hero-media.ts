import type { StaticImageData } from "next/image";
import mainSmall from "@/assets/heroes/main-640.webp";
import mainMedium from "@/assets/heroes/main-1024.webp";
import mainFull from "@/assets/heroes/main-1672.webp";
import agricultureSmall from "@/assets/heroes/agriculture-640.webp";
import agricultureMedium from "@/assets/heroes/agriculture-1024.webp";
import agricultureFull from "@/assets/heroes/agriculture-1672.webp";
import agroSmall from "@/assets/heroes/agro-real-estate-640.webp";
import agroMedium from "@/assets/heroes/agro-real-estate-1024.webp";
import agroFull from "@/assets/heroes/agro-real-estate-1451.webp";
import flexisaveSmall from "@/assets/heroes/flexisave-640.webp";
import flexisaveMedium from "@/assets/heroes/flexisave-1024.webp";
import flexisaveFull from "@/assets/heroes/flexisave-1671.webp";
import partnerSmall from "@/assets/heroes/partner-640.webp";
import partnerMedium from "@/assets/heroes/partner-1024.webp";
import partnerFull from "@/assets/heroes/partner-1672.webp";

export type HeroImageAsset = { small: StaticImageData; medium: StaticImageData; full: StaticImageData };
export const heroMedia = {
  main: { small: mainSmall, medium: mainMedium, full: mainFull },
  agriculture: { small: agricultureSmall, medium: agricultureMedium, full: agricultureFull },
  agroRealEstate: { small: agroSmall, medium: agroMedium, full: agroFull },
  flexisave: { small: flexisaveSmall, medium: flexisaveMedium, full: flexisaveFull },
  partner: { small: partnerSmall, medium: partnerMedium, full: partnerFull }
} satisfies Record<string, HeroImageAsset>;

// These files are prepared ahead of deployment. Image requests do not need a
// cold runtime conversion, and each viewport receives an appropriate size.
export function heroImageSource(asset: HeroImageAsset, width: number) {
  return (width <= 640 ? asset.small : width <= 1024 ? asset.medium : asset.full).src;
}
