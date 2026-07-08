import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Business } from "@/types/site";
import { ImageCanvas } from "@/components/image-canvas";

type BusinessCardProps = {
  business: Business;
};

export function BusinessCard({ business }: BusinessCardProps) {
  const borderColor = business.accent === "green" ? "border-agriculture/20" : "border-orangeAction/20";

  return (
    <article className={`rounded-card border ${borderColor} bg-white p-5 shadow-sm`}>
      <ImageCanvas label={business.imageCanvas} accent={business.accent} compact />
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-ink">{business.name}</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {business.sections.map((section) => (
              <li key={section.href} className="rounded-full border border-stone-200 px-3 py-1 text-xs font-medium text-stone-600">
                {section.name}
              </li>
            ))}
          </ul>
        </div>
        <Link
          href={business.href}
          aria-label={`Open ${business.name}`}
          className="rounded-card border border-orangeAction/30 p-2 text-orangeAction hover:bg-orange-50"
        >
          <ArrowRight aria-hidden="true" className="h-5 w-5" />
        </Link>
      </div>
    </article>
  );
}
