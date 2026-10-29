import { ButtonLink } from "@/components/button-link";
import { FaqSection } from "@/components/faq-section";
import { PageHero } from "@/components/page-hero";
import { PageSection } from "@/components/page-section";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";
import { heroMedia } from "@/lib/hero-media";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata("/businesses/flexisave", "Flexisave", "De Jadon Group’s structured savings solution, designed to encourage disciplined financial planning and help people work towards specific financial goals.");

export default function FlexisavePage() {
  return (
    <SiteLayout>
      <PageHero title="Flexisave" eyebrow="Structured savings" image={heroMedia.flexisave} accent="green" actions={<ButtonLink href="/contact">Ask about Flexisave</ButtonLink>}>
        <p>A structured savings solution designed to encourage disciplined financial planning and help you work towards specific financial goals.</p>
      </PageHero>
      <PageSection>
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <SectionHeader title="Work towards your goals." eyebrow="Plan ahead" accent="green" />
          <div>
            <p className="max-w-2xl text-lg leading-8 text-stone-600">Flexisave is part of De Jadon Group’s work across agriculture, real estate and structured savings. It supports disciplined financial planning as you work towards the goals that matter to you.</p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">Speak with our team about current savings options, how to participate and the applicable terms.</p>
            <div className="mt-7 flex flex-wrap gap-4"><ButtonLink href="mailto:dejadongroup@gmail.com?subject=Flexisave%20enquiry">Enquire about Flexisave</ButtonLink><ButtonLink href="/businesses" variant="outline">All businesses</ButtonLink></div>
          </div>
        </div>
      </PageSection>
      <FaqSection accent="green" items={[
        { question: "What is Flexisave?", answer: "Flexisave is De Jadon Group’s structured savings solution, designed to encourage disciplined financial planning and help people work towards specific financial goals." },
        { question: "Where can I find the current savings options and terms?", answer: "Contact our team for the current options, how to participate and the applicable terms." },
        { question: "How do I enquire about Flexisave?", answer: "Use the enquiry button on this page or email dejadongroup@gmail.com with your Flexisave questions." }
      ]} />
    </SiteLayout>
  );
}
