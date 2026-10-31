import { publicPageMetadata } from "@/lib/seo";
import { companyContact, salesWhatsapp, socialLinks } from "@/lib/site-data";
import { SocialIcon } from "@/components/social-icon";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { FaqSection } from "@/components/faq-section";
import { OfficeMapPreview } from "@/components/office-map-preview";
import { PageHero } from "@/components/page-hero";
import { PageSection } from "@/components/page-section";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";

const inquiryOptions = ["Agriculture", "Agro-Real Estate", "Flexisave", "Partner Program"];
const emailAddress = "dejadongroup@gmail.com";

export const metadata = publicPageMetadata("/contact", "Contact us", "Contact De Jadon Group for business enquiries. Find our phone number, email, office address and working hours.");

export default function ContactPage() {
  return (
    <SiteLayout>
      <PageSection>
        <PageHero
          title="Let’s talk"
          eyebrow="Contact De Jadon Group"
          actions={
            <>
              <ButtonLink href={`mailto:${emailAddress}`}>Send an email</ButtonLink>
              <ButtonLink href="tel:+2348070458759" variant="outline">Call us</ButtonLink>
            </>
          }
        >
          <p>Get in touch with De Jadon Group for enquiries about Agriculture, Agro-Real Estate, Flexisave, the Partner Program, or general company information.</p>
        </PageHero>
      </PageSection>
      <PageSection tinted>
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-24">
          <div>
            <SectionHeader title="How can we help?" />
            <p className="mt-5 max-w-md leading-7 text-stone-600">Choose an area to start an email inquiry with our team.</p>
            <div className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
              {inquiryOptions.map((option) => (
                <Link
                  key={option}
                  href={`mailto:${emailAddress}?subject=${encodeURIComponent(`${option} inquiry`)}`}
                  className="group flex items-center justify-between gap-6 py-6 text-xl font-medium text-ink transition-colors hover:text-orangeAction"
                >
                  {option}
                  <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0 text-orangeAction transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>
          <div>
            <SectionHeader title="Contact details" />
            <dl className="mt-8 space-y-7 text-base leading-7">
              <div>
                <dt className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Phone</dt>
                <dd><a className="text-lg text-ink underline decoration-ink/20 underline-offset-4 hover:text-orangeAction" href="tel:+2348070458759">08070458759</a></dd>
              </div>
              <div>
                <dt className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">WhatsApp marketplace / sales support</dt>
                <dd><a href={salesWhatsapp.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-lg text-ink underline decoration-ink/20 underline-offset-4 hover:text-orangeAction"><SocialIcon platform="whatsapp" className="h-5 w-5 shrink-0" />{salesWhatsapp.phone}</a></dd>
              </div>
              <div>
                <dt className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Email</dt>
                <dd><a className="break-words text-lg text-ink underline decoration-ink/20 underline-offset-4 hover:text-orangeAction" href={`mailto:${emailAddress}`}>{emailAddress}</a></dd>
              </div>
              <div>
                <dt className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Office</dt>
                <dd className="max-w-md text-stone-700">{companyContact.office}</dd>
              </div>
              <div>
                <dt className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Working hours</dt>
                <dd className="text-stone-700">{companyContact.workingHours}</dd>
              </div>
            </dl>
            <OfficeMapPreview className="mt-7" />
            <section className="mt-9 border-t border-ink/10 pt-7" aria-label="Company social profiles">
              <h2 className="text-xl">Find us on social media</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">{socialLinks.map((profile) => <li key={profile.platform}><a href={profile.href} target="_blank" rel="noreferrer" aria-label={profile.label} className="flex min-h-11 items-center gap-3 rounded-card px-2 py-2 text-sm text-stone-700 hover:bg-orange-50 hover:text-orange-700"><SocialIcon platform={profile.platform} className="h-5 w-5 shrink-0" /><span>{profile.handle}</span></a></li>)}</ul>
            </section>
          </div>
        </div>
      </PageSection>
      <FaqSection items={[
        { question: "How can I contact De Jadon Group?", answer: `Call 08070458759 or email ${emailAddress}. You can also use the enquiry links above to start an email about a particular business.` },
        { question: "Where is your office?", answer: companyContact.office },
        { question: "What are your working hours?", answer: companyContact.workingHours },
        { question: "What can I enquire about?", answer: "Our team handles enquiries about Agriculture, Agro-Real Estate, Flexisave, the Partner Programme and general company information." }
      ]} />
    </SiteLayout>
  );
}
