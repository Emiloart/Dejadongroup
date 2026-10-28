import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import agricultureHero from "@/assets/agriculture_hero.png";
import agroRealEstateHero from "@/assets/Agro-realestate_hero.png";
import type { Business } from "@/types/site";

type BusinessCardProps = {
  business: Business;
  showSections?: boolean;
};

const businessPreviews = {
  agriculture: {
    image: agricultureHero,
    description: "Food production through crop farming, poultry, fishery and sustainable farming."
  },
  "agro-real-estate": {
    image: agroRealEstateHero,
    description: "Own productive farmland through cultivated land sales and managed farming opportunities."
  }
};

export function BusinessCard({ business, showSections = false }: BusinessCardProps) {
  const linkTone = business.accent === "green" ? "hover:text-agriculture" : "hover:text-orangeAction";
  const preview = businessPreviews[business.slug];

  return (
    <article className="h-full min-w-0 overflow-hidden rounded-card border border-ink/10 bg-white">
      <Link href={business.href} className={`group block focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-orangeAction ${linkTone}`}>
        <div className="relative aspect-[16/9] overflow-hidden bg-stone-100">
          <Image src={preview.image} alt="" fill sizes={showSections ? "(min-width: 1024px) 580px, (min-width: 640px) 50vw, 100vw" : "(min-width: 640px) 320px, 280px"} className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105" />
        </div>
        <div className="p-5">
          <h3 className="text-xl font-semibold text-ink">{business.name}</h3>
          <p className="mt-2 text-sm leading-6 text-stone-600">{preview.description}</p>
          <span className={`mt-5 flex items-center gap-2 text-sm font-semibold ${business.accent === "green" ? "text-agriculture" : "text-orangeAction"}`}>
            Explore business
            <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
      {showSections ? (
        <ul className="mx-5 grid gap-x-6 border-t border-ink/10 py-3 sm:grid-cols-2">
          {business.sections.map((section) => (
            <li key={section.href}>
              <Link href={section.href} className={`inline-flex min-h-11 items-center py-2 text-sm leading-6 text-stone-600 underline-offset-4 transition-colors hover:underline ${linkTone}`}>
                {section.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
