import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Business } from "@/types/site";
import { ImageCanvas } from "@/components/image-canvas";

type BusinessCardProps = {
  business: Business;
};

export function BusinessCard({ business }: BusinessCardProps) {
  const borderColor = business.accent === "green" ? "border-agriculture/20" : "border-orangeAction/20";

  const accentLine = business.accent === "green" ? "bg-agriculture" : "bg-orangeAction";

  return (
    <article
      className={`group overflow-hidden rounded-card border ${borderColor} bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-5`}
    >
      <div className={`mb-4 h-1 w-14 rounded-full ${accentLine} transition group-hover:w-24`} />
      <ImageCanvas label={business.imageCanvas} accent={business.accent} compact />
      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
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
          className="inline-flex w-full items-center justify-center gap-2 rounded-card border border-orangeAction/30 px-4 py-3 text-sm font-semibold text-orangeAction hover:bg-orange-50 sm:w-auto sm:p-2"
        >
          <span className="sm:hidden">Open</span>
          <ArrowRight aria-hidden="true" className="h-5 w-5" />
        </Link>
      </div>
    </article>
  );
}
