import { PageSection } from "@/components/page-section";
import { SectionHeader } from "@/components/section-header";
import type { Accent } from "@/types/site";

type FaqSectionProps = {
  items: ReadonlyArray<{ question: string; answer: string }>;
  accent?: Accent;
};

export function FaqSection({ items, accent = "orange" }: FaqSectionProps) {
  return (
    <PageSection tinted>
      <div id="faqs" className="scroll-mt-28 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionHeader title="Frequently asked questions" eyebrow="Good to know" accent={accent} />
        <div className="divide-y divide-ink/10 border-y border-ink/10">
          {items.map((faq) => (
            <details key={faq.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-base font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span aria-hidden="true" className={`text-xl font-normal transition-transform group-open:rotate-45 ${accent === "green" ? "text-agriculture" : "text-orangeAction"}`}>+</span>
              </summary>
              <p className="max-w-2xl pb-1 pt-4 leading-7 text-stone-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </PageSection>
  );
}
