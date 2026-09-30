import { ContentSlot } from "@/components/content-slot";
import { ImageCanvas } from "@/components/image-canvas";
import { InfoCard } from "@/components/info-card";
import { PageHero } from "@/components/page-hero";
import { PageSection } from "@/components/page-section";
import { SiteLayout } from "@/components/site-layout";

const inquiryOptions = ["Agriculture", "Agro-Real Estate", "Partner Program"];

export default function ContactPage() {
  return (
    <SiteLayout>
      <PageSection>
        <PageHero title="Contact" eyebrow="De Jadon Group" canvasLabel="Contact Image Canvas">
          <p className="max-w-2xl leading-7 text-stone-700">Get in touch with De Jadon Group for enquiries about Agriculture, Agro-Real Estate, the Partner Program, or general company information.</p>
        </PageHero>
      </PageSection>
      <PageSection tinted>
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="grid gap-4">
            {inquiryOptions.map((option) => (
              <InfoCard key={option} title={option}>
                <p className="leading-6 text-stone-700">Contact: 08070458759</p>
              </InfoCard>
            ))}
            <ImageCanvas label="Map / Location Image Canvas" compact />
          </div>
          <form className="rounded-card border border-orangeAction/20 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-orangeAction">Inquiry Form</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">Contact</h2>
            </div>
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-stone-700">
                Name
                <input className="min-h-11 rounded-card border border-stone-200 px-3 outline-none focus:border-orangeAction" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-stone-700">
                Email
                <input className="min-h-11 rounded-card border border-stone-200 px-3 outline-none focus:border-orangeAction" type="email" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-stone-700">
                Inquiry
                <select className="min-h-11 rounded-card border border-stone-200 px-3 outline-none focus:border-orangeAction" defaultValue="">
                  <option value="" disabled>
                    Select Inquiry
                  </option>
                  {inquiryOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-stone-700">
                Message
                <textarea className="min-h-36 rounded-card border border-stone-200 px-3 py-3 outline-none focus:border-orangeAction" />
              </label>
              <button className="min-h-11 rounded-card bg-orangeAction px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600" type="button">
                Submit
              </button>
            </div>
          </form>
        </div>
      </PageSection>
    </SiteLayout>
  );
}
