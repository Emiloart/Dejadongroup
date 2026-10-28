import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { adminSubsections } from "@/lib/admin-data";

export function generateStaticParams() {
  return adminSubsections.map(({ id }) => ({ section: id }));
}

export default function AdminSectionPage({ params }: { params: { section: string } }) {
  const section = adminSubsections.find((item) => item.id === params.section);
  if (!section) notFound();

  return (
    <AdminShell section={section.id}>
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">Admin section</p>
        <h1 className="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">{section.label}</h1>
        <p className="mt-4 text-sm leading-7 text-stone-600">{section.description}</p>
      </div>
      <section aria-labelledby="empty-heading" className="mt-12 border-y border-ink/10 py-8 sm:py-10">
        <h2 id="empty-heading" className="text-2xl font-medium">Workspace in progress</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">This section is ready for its tools and records. No live admin data is connected in this layout preview.</p>
        <Link href="/admin" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-orange-700 hover:text-orange-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to overview
        </Link>
      </section>
    </AdminShell>
  );
}
