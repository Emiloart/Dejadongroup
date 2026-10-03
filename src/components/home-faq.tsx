"use client";

import { ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";

const destinations: Record<string, { text: string; label: string; href: string }> = {
  "Agriculture FAQ": { text: "Explore our crop farming, livestock and agricultural products, and find answers to common questions.", label: "Explore agriculture", href: "/businesses/agriculture" },
  "Agro-Real Estate FAQ": { text: "Find information about agricultural land, managed cultivation and the buying process.", label: "Read agro-real estate FAQs", href: "/businesses/agro-real-estate/faqs" },
  "Partner Program FAQ": { text: "Partners receive a 10% commission when a referred prospect becomes a paying client. Visit the program page for available details.", label: "Explore the partner program", href: "/partner-program" },
  "Contact FAQ": { text: "Find our office address, phone number, email and working hours on the contact page.", label: "Contact the team", href: "/contact" }
};

export function HomeFaq({ sections }: { sections: string[] }) {
  const [openSection, setOpenSection] = useState<number | null>(null);
  const id = useId();
  return (
    <div className="border-t border-ink/10">
      {sections.map((section, index) => {
        const isOpen = openSection === index;
        const answer = destinations[section];
        return (
          <div key={section} className="border-b border-ink/10">
            <h3>
              <button id={`${id}-question-${index}`} type="button" aria-expanded={isOpen} aria-controls={`${id}-answer-${index}`} className="flex min-h-16 w-full items-center justify-between gap-5 py-5 text-left font-sans text-base font-medium text-ink hover:text-orangeAction" onClick={() => setOpenSection(isOpen ? null : index)}>
                {section.replace(/ FAQ$/, "")}<Plus aria-hidden="true" className={`h-4 w-4 shrink-0 text-orangeAction transition-transform ${isOpen ? "rotate-45" : ""}`} />
              </button>
            </h3>
            <div id={`${id}-answer-${index}`} role="region" aria-labelledby={`${id}-question-${index}`} hidden={!isOpen} className="max-w-xl pb-6 pr-6">
              <p className="text-sm leading-7 text-stone-600">{answer?.text ?? "Please contact our team for more information."}</p>
              <Link href={answer?.href ?? "/contact"} className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-orangeAction hover:underline">{answer?.label ?? "Contact the team"}<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
