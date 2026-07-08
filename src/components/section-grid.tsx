import Link from "next/link";
import type { BusinessSection } from "@/types/site";

type SectionGridProps = {
  sections: BusinessSection[];
};

export function SectionGrid({ sections }: SectionGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sections.map((section) => (
        <Link
          key={section.href}
          href={section.href}
          className="rounded-card border border-stone-200 bg-white p-5 text-base font-semibold text-ink shadow-sm hover:border-orangeAction/40"
        >
          {section.name}
        </Link>
      ))}
    </div>
  );
}
