import { PortalAuthForm } from "@/components/portal-auth-form";
import { ContentPhoto } from "@/components/content-photo";
import { SiteLayout } from "@/components/site-layout";
import { ArrowUpRight, KeyRound, MailCheck } from "lucide-react";
import Link from "next/link";
import type { DashboardRole } from "@/types/site";

type LoginPageProps = { searchParams?: Promise<{ role?: string; next?: string; mode?: string; ref?: string }> };

export const metadata = { title: "Your portal", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams: searchParamsPromise }: LoginPageProps) {
  const searchParams = await searchParamsPromise;
  const initialRole: DashboardRole = searchParams?.role === "client" ? "client" : "partner";

  return (
    <SiteLayout>
      <section className="bg-warm">
        <div className="mx-auto grid max-w-7xl items-start gap-8 px-5 py-10 sm:px-6 sm:py-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:px-8 lg:py-20">
          <div className="lg:pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">Welcome to De Jadon Group</p>
            <h1 className="mt-4 max-w-lg text-3xl leading-tight sm:text-5xl">Your De Jadon workspace.</h1>
            <p className="mt-3 max-w-md text-sm leading-7 text-stone-600 sm:mt-4 sm:text-base">Stay connected to your plans, your partnership and the next step in your journey.</p>
            <div className="mt-8 hidden overflow-hidden rounded-2xl border border-ink/10 bg-white sm:block">
              <ContentPhoto name="teamOutreach" aspectRatio={1.65} className="!rounded-none" imageClassName="object-center" sizes="(min-width: 1024px) 42vw, 85vw" />
              <p className="px-5 py-3 text-xs leading-6 text-stone-600">De Jadon Group, connecting with our community.</p>
            </div>
            <div className="mt-7 hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="flex gap-3"><KeyRound aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-agriculture" /><p className="text-xs leading-6 text-stone-600"><span className="block font-semibold text-ink">Client access</span>Activate with the token supplied by our team.</p></div>
              <div className="flex gap-3"><MailCheck aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-agriculture" /><p className="text-xs leading-6 text-stone-600"><span className="block font-semibold text-ink">Partner registration</span>Verify your email, add your details and choose a tier.</p></div>
            </div>
            <Link href="/contact" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-orange-700 hover:underline">Need a hand? Talk to our team<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link>
          </div>
          <div className="min-w-0 rounded-2xl border border-ink/10 bg-white p-5 shadow-[0_12px_48px_-28px_rgba(36,31,25,0.3)] sm:p-8 lg:p-9">
            <PortalAuthForm initialRole={initialRole} initialMode={searchParams?.mode === "signup" ? "signup" : "signin"} referral={searchParams?.ref} nextPath={searchParams?.next} />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
