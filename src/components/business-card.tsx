import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Business } from "@/types/site";
import { ImageCanvas } from "@/components/image-canvas";

type BusinessCardProps = {
  business: Business;
};

export function BusinessCard({ business }: BusinessCardProps) {
  const linkTone = business.accent === "green" ? "hover:text-agriculture" : "hover:text-orangeAction";

  return (
    <article className="min-w-0">
      <ImageCanvas label={business.imageCanvas} accent={business.accent} compact />
      <div className="mt-5">
        <h3 className="text-2xl font-medium text-ink">
          <Link href={business.href} className={`flex min-h-11 items-center justify-between gap-4 transition-colors ${linkTone}`}>
            <span>{business.name}</span>
            <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0" />
          </Link>
        </h3>
        <ul className="mt-3 grid gap-x-6 sm:grid-cols-2">
          {business.sections.map((section) => (
            <li key={section.href}>
              <Link href={section.href} className={`inline-flex min-h-11 items-center py-2 text-sm leading-6 text-stone-600 underline-offset-4 transition-colors hover:underline ${linkTone}`}>
                {section.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
