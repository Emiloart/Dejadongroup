import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ContentSlot } from "@/components/content-slot";
import { ImageCanvas } from "@/components/image-canvas";
import type { Accent } from "@/types/site";

type InfoCardProps = {
  title: string;
  label?: string;
  slotLabel?: string;
  canvasLabel?: string;
  href?: string;
  accent?: Accent;
  children?: ReactNode;
};

export function InfoCard({ title, label, slotLabel, canvasLabel, href, accent = "orange", children }: InfoCardProps) {
  const tone =
    accent === "green"
      ? "border-agriculture/20 hover:border-agriculture/45"
      : "border-orangeAction/20 hover:border-orangeAction/45";
  const line = accent === "green" ? "bg-agriculture" : "bg-orangeAction";

  return (
    <article className={`group rounded-card border ${tone} bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md`}>
      <div className={`mb-4 h-1 w-12 rounded-full ${line} transition group-hover:w-20`} />
      {label ? <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-stone-500">{label}</p> : null}
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {href ? (
          <Link
            href={href}
            aria-label={`Open ${title}`}
            className="rounded-card border border-orangeAction/25 p-2 text-orangeAction hover:bg-orange-50"
          >
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
      {slotLabel ? (
        <div className="mt-4">
          <ContentSlot label={slotLabel} accent={accent} />
        </div>
      ) : null}
      {canvasLabel ? (
        <div className="mt-4">
          <ImageCanvas label={canvasLabel} accent={accent} compact />
        </div>
      ) : null}
    </article>
  );
}
