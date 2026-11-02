import Link from "next/link";
import { Download, ExternalLink, FileText, ImageIcon, PlaySquare } from "lucide-react";
import type { PartnerResource } from "@/lib/partner-resources";

export function PartnerResources({ resources }: { resources: PartnerResource[] }) {
  return <section id="resources" aria-labelledby="resources-heading" className="mt-10">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-agriculture">Partner tools</p><h2 id="resources-heading" className="mt-2 text-2xl">Resources & marketing materials</h2></div><Link href="/marketplace" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-orange-700">Explore products <ExternalLink size={15} aria-hidden="true" /></Link></div>
    <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">Use the latest approved guides, product information and campaign materials available to your membership.</p>
    {resources.length ? <div className="mt-5 grid gap-5 sm:grid-cols-2">{resources.map((resource) => {
      const image = resource.file?.mime.startsWith("image/"); const video = resource.file?.mime.startsWith("video/");
      const Icon = image ? ImageIcon : video ? PlaySquare : FileText;
      return <article key={resource.id} className="min-w-0 overflow-hidden rounded-card border border-ink/10 bg-white">
        {image ? <div role="img" aria-label={resource.title} className="aspect-[16/9] bg-stone-100 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url('${resource.file!.previewUrl}')` }} /> : video ? <video controls preload="metadata" aria-label={resource.title} className="aspect-video w-full bg-ink"><source src={resource.file!.previewUrl} type={resource.file!.mime} /></video> : <div className="flex items-center gap-3 bg-warm px-5 py-4 text-agriculture"><Icon size={22} aria-hidden="true" /><span className="text-xs font-semibold uppercase tracking-widest">{resource.file ? "Partner document" : "Partner link"}</span></div>}
        <div className="p-5"><h3 className="break-words text-xl">{resource.title}</h3><p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-stone-600">{resource.summary || resource.body}</p>{resource.summary && resource.body !== resource.summary ? <details className="mt-3 text-sm leading-7 text-stone-600"><summary className="cursor-pointer font-semibold text-ink">Usage notes</summary><p className="mt-2 whitespace-pre-line break-words">{resource.body}</p></details> : null}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">{resource.file ? <a href={resource.file.downloadUrl} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-orange-700"><Download size={16} aria-hidden="true" />Download {resource.file.mime === "application/pdf" ? "PDF" : image ? "image" : "video"}<span className="font-normal text-stone-500">{Math.ceil(resource.file.bytes / 1024)} KB</span></a> : null}{resource.href ? <a href={resource.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-orange-700">Open resource <ExternalLink size={15} aria-hidden="true" /></a> : null}</div>
        </div>
      </article>;
    })}</div> : <div className="mt-5 flex items-start gap-4 rounded-card border border-dashed border-ink/20 bg-white p-6"><FileText className="mt-1 shrink-0 text-agriculture" size={24} aria-hidden="true" /><div><h3 className="text-lg">Your resource library is being prepared</h3><p className="mt-2 text-sm leading-7 text-stone-600">Published guides and marketing materials for your tier will appear here. Your existing tier benefits remain available above.</p></div></div>}
  </section>;
}
