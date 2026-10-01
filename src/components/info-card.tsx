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
  const linkTone = accent === "green" ? "hover:text-agriculture" : "hover:text-orangeAction";

  return (
    <article className="min-w-0 border-t border-stone-200/80 pt-6">
      {canvasLabel ? <ImageCanvas label={canvasLabel} accent={accent} compact className="mb-5" /> : null}
      {label ? <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">{label}</p> : null}
      <h3 className="text-xl font-medium leading-snug text-ink">
        {href ? (
          <Link href={href} className={`flex min-h-11 items-center justify-between gap-4 transition-colors ${linkTone}`}>
            <span>{title}</span>
            <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
          </Link>
        ) : title}
      </h3>
      {children ? <div className="mt-3 text-sm leading-7 text-stone-600">{children}</div> : null}
      {slotLabel ? (
        <div className="mt-3">
          <ContentSlot label={slotLabel} accent={accent} />
        </div>
      ) : null}
    </article>
  );
}
