import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { PageHero } from "@/components/page-hero";
import { PageSection } from "@/components/page-section";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";

const inquiryOptions = ["Agriculture", "Agro-Real Estate", "Partner Program"];
const emailAddress = "dejadongroup@gmail.com";

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
          <p>Get in touch with De Jadon Group for enquiries about Agriculture, Agro-Real Estate, the Partner Program, or general company information.</p>
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
                <dt className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Email</dt>
                <dd><a className="break-words text-lg text-ink underline decoration-ink/20 underline-offset-4 hover:text-orangeAction" href={`mailto:${emailAddress}`}>{emailAddress}</a></dd>
              </div>
              <div>
                <dt className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Office</dt>
                <dd className="max-w-md text-stone-700">Shop C15 Ebube Dike Shopping Mall, Umuodu Road, Good Will Junction, Nodu, Okpuno, Awka, Anambra State.</dd>
              </div>
              <div>
                <dt className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Working hours</dt>
                <dd className="text-stone-700">8:30am – 5:00pm</dd>
              </div>
            </dl>
          </div>
        </div>
      </PageSection>
    </SiteLayout>
  );
}
