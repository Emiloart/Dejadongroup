import type { HeroImageAsset } from "@/lib/hero-media";
import ceo640 from "@/assets/photos/ceo-640.webp";
import ceo960 from "@/assets/photos/ceo-960.webp";
import broiler1280 from "@/assets/photos/broiler-chickens-1280.webp";
import broiler640 from "@/assets/photos/broiler-chickens-640.webp";
import broiler960 from "@/assets/photos/broiler-chickens-960.webp";
import catfish572 from "@/assets/photos/catfish-572.webp";
import greenPeppers554 from "@/assets/photos/green-peppers-554.webp";
import pepperPlant640 from "@/assets/photos/pepper-plant-640.webp";
import pepperPlant960 from "@/assets/photos/pepper-plant-960.webp";
import palmFruit1200 from "@/assets/photos/palm-fruit-1200.webp";
import palmFruit640 from "@/assets/photos/palm-fruit-640.webp";
import palmFruit960 from "@/assets/photos/palm-fruit-960.webp";
import estateVisit640 from "@/assets/photos/alaoma-estate-visit-640.webp";
import estateVisit960 from "@/assets/photos/alaoma-estate-visit-960.webp";
import teamOutreach640 from "@/assets/photos/team-outreach-640.webp";
import teamOutreach960 from "@/assets/photos/team-outreach-960.webp";
import agricultureEditorial640 from "@/assets/editorial/agriculture-food-systems-640.webp";
import agricultureEditorial960 from "@/assets/editorial/agriculture-food-systems-960.webp";
import agricultureEditorial1440 from "@/assets/editorial/agriculture-food-systems-1440.webp";

export const contentPhotos = {
  agricultureEditorial: { image: { small: agricultureEditorial640, medium: agricultureEditorial960, full: agricultureEditorial1440 }, alt: "Editorial illustration of pepper crops, oil palms, a fish pond and poultry in a tropical agricultural landscape" },
  ceo: { image: { small: ceo640, medium: ceo960, full: ceo960 }, alt: "Ifeanyi Luke Ananwude, Founder and Managing Director of De Jadon Group" },
  broiler: { image: { small: broiler640, medium: broiler960, full: broiler1280 }, alt: "Broiler chickens" },
  catfish: { image: { small: catfish572, medium: catfish572, full: catfish572 }, alt: "Fresh catfish" },
  greenPeppers: { image: { small: greenPeppers554, medium: greenPeppers554, full: greenPeppers554 }, alt: "Green peppers on the plant" },
  pepperPlant: { image: { small: pepperPlant640, medium: pepperPlant960, full: pepperPlant960 }, alt: "Ripening peppers" },
  palmFruit: { image: { small: palmFruit640, medium: palmFruit960, full: palmFruit1200 }, alt: "Palm fruit on the tree" },
  estateVisit: { image: { small: estateVisit640, medium: estateVisit960, full: estateVisit960 }, alt: "Group visit at Alaoma Estate" },
  teamOutreach: { image: { small: teamOutreach640, medium: teamOutreach960, full: teamOutreach960 }, alt: "De Jadon Group team outreach" },
} satisfies Record<string, { image: HeroImageAsset; alt: string }>;

export type ContentPhotoName = keyof typeof contentPhotos;
