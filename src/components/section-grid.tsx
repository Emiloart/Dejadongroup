import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BusinessSection } from "@/types/site";

type SectionGridProps = {
  sections: BusinessSection[];
  accent?: "orange" | "green";
};

export function SectionGrid({ sections, accent = "orange" }: SectionGridProps) {
  const linkTone = accent === "green" ? "hover:text-agriculture" : "hover:text-orangeAction";

  return (
    <div className="grid gap-x-10 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
      {sections.map((section) => (
        <Link
          key={section.href}
          href={section.href}
          className={`border-t border-stone-200 py-6 text-base font-medium text-ink transition-colors ${linkTone}`}
        >
          <span className="flex items-center justify-between gap-4">
            <span>{section.name}</span>
            <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
          </span>
          {section.sections?.length ? (
            <span className="mt-3 block text-sm font-normal leading-6 text-stone-500">
              {section.sections.map((child) => child.name).join(" · ")}
            </span>
          ) : null}
        </Link>
      ))}
    </div>
  );
}
