import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BusinessSection } from "@/types/site";

type SectionGridProps = {
  sections: BusinessSection[];
  accent?: "orange" | "green";
};

export function SectionGrid({ sections, accent = "orange" }: SectionGridProps) {
  const line = accent === "green" ? "bg-agriculture" : "bg-orangeAction";
  const border = accent === "green" ? "hover:border-agriculture/40" : "hover:border-orangeAction/40";

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sections.map((section) => (
        <Link
          key={section.href}
          href={section.href}
          className={`group rounded-card border border-stone-200 bg-white p-5 text-base font-semibold text-ink shadow-sm transition hover:-translate-y-1 hover:shadow-md ${border}`}
        >
          <span className={`mb-4 block h-1 w-10 rounded-full ${line} transition group-hover:w-16`} />
          <span className="flex items-center justify-between gap-4">
            <span>{section.name}</span>
            <ArrowRight aria-hidden="true" className="h-4 w-4 text-orangeAction" />
          </span>
          {section.sections?.length ? (
            <span className="mt-4 flex flex-wrap gap-2">
              {section.sections.map((child) => (
                <span key={child.href} className="rounded-full border border-stone-200 px-2 py-1 text-xs text-stone-500">
                  {child.name}
                </span>
              ))}
            </span>
          ) : null}
        </Link>
      ))}
    </div>
  );
}
