import { ArrowUpRight } from "lucide-react";
import { companyMapEmbedHref, companyMapHref } from "@/lib/site-data";

export function OfficeMapPreview({ className = "" }: { className?: string }) {
  return (
    <figure className={`w-full max-w-[420px] overflow-hidden rounded-2xl border border-ink/10 bg-white ${className}`}>
      <iframe
        title="Office area map: Ebube Dike Shopping Mall, Umuodu Road, Awka"
        src={companyMapEmbedHref}
        width="420"
        height="180"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block h-[180px] w-full border-0"
      />
      <figcaption className="flex items-center justify-between gap-3 px-4 py-3">
        <span className="text-xs text-stone-500">Office area</span>
        <a href={companyMapHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700 underline underline-offset-4">
          Open in Google Maps
          <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
        </a>
      </figcaption>
    </figure>
  );
}
