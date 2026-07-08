"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { ContentSlot } from "@/components/content-slot";

type HomeFaqProps = {
  sections: string[];
};

export function HomeFaq({ sections }: HomeFaqProps) {
  const [openSection, setOpenSection] = useState(0);

  return (
    <div className="grid gap-3">
      {sections.map((section, index) => {
        const isOpen = openSection === index;

        return (
          <article key={section} className="overflow-hidden rounded-card border border-stone-200 bg-white shadow-sm">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-ink hover:bg-orange-50"
              onClick={() => setOpenSection(isOpen ? -1 : index)}
            >
              <span>{section}</span>
              <ChevronDown
                aria-hidden="true"
                className={`h-5 w-5 text-orangeAction transition ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen ? (
              <div className="border-t border-stone-200 p-5">
                <ContentSlot label={`${section} Answer Slot`} />
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
