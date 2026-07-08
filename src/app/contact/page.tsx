import { PageSection } from "@/components/page-section";
import { SectionHeader } from "@/components/section-header";
import { SiteLayout } from "@/components/site-layout";

const inquiryOptions = ["Agriculture", "Agro-Real Estate", "Partner Program"];

export default function ContactPage() {
  return (
    <SiteLayout>
      <PageSection>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1fr]">
          <SectionHeader title="Contact" />
          <form className="rounded-card border border-stone-200 bg-white p-6 shadow-sm">
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
