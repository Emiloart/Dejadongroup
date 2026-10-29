import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const destinations: Record<string, string> = {
  "Agriculture FAQ": "/businesses/agriculture#faqs",
  "Agro-Real Estate FAQ": "/businesses/agro-real-estate/faqs#faqs",
  "Flexisave FAQ": "/businesses/flexisave#faqs",
  "Partner Program FAQ": "/partner-program#faqs",
  "Contact FAQ": "/contact#faqs"
};

export function HomeFaq({ sections }: { sections: string[] }) {
  return (
    <div className="border-t border-ink/10">
      {sections.map((section) => (
        <h3 key={section} className="border-b border-ink/10">
          <Link
            href={destinations[section] ?? "/contact#faqs"}
            className="flex min-h-16 items-center justify-between gap-5 py-5 font-sans text-base font-medium text-ink hover:text-orangeAction"
          >
            {section.replace(/ FAQ$/, "")}
            <span className="sr-only"> frequently asked questions</span>
            <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 text-orangeAction" />
          </Link>
        </h3>
      ))}
    </div>
  );
}
