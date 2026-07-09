import { ImageCanvas } from "@/components/image-canvas";
import { ContentSlot } from "@/components/content-slot";
import type { DashboardCard as DashboardCardType } from "@/types/site";

type DashboardCardProps = {
  card: DashboardCardType;
  id?: string;
};

export function DashboardCard({ card, id }: DashboardCardProps) {
  return (
    <article
      id={id}
      className={`scroll-mt-28 rounded-card border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
        card.wide ? "lg:col-span-2" : ""
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-orangeAction">{card.group}</p>
          <h2 className="mt-2 text-lg font-semibold text-ink">{card.title}</h2>
        </div>
        <div className="h-1 w-12 rounded-full bg-orangeAction" />
      </div>
      {card.canvas ? (
        <div className="mt-4">
          <ImageCanvas label={card.title} compact />
        </div>
      ) : null}
      {card.fields ? (
        <div className="mt-5 grid gap-3">
          {card.fields.map((field) => (
            <div key={field} className="grid gap-2 rounded-card border border-stone-100 bg-warm p-3">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-stone-500">{field}</span>
              <span className="h-2 w-2/3 rounded-full bg-stone-200" />
            </div>
          ))}
        </div>
      ) : null}
      {!card.canvas && !card.fields ? (
        <div className="mt-5 grid gap-3">
          <ContentSlot label={`${card.title} Panel`} />
          <div className="grid gap-2 rounded-card border border-stone-100 bg-warm p-4">
            <div className="h-2 w-3/4 rounded-full bg-stone-200" />
            <div className="h-2 w-1/2 rounded-full bg-stone-200" />
          </div>
        </div>
      ) : null}
    </article>
  );
}
