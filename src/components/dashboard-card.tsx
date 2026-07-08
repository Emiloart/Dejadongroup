import { ImageCanvas } from "@/components/image-canvas";
import { ContentSlot } from "@/components/content-slot";
import type { DashboardCard as DashboardCardType } from "@/types/site";

type DashboardCardProps = {
  card: DashboardCardType;
  id?: string;
};

export function DashboardCard({ card, id }: DashboardCardProps) {
  return (
    <article id={id} className="scroll-mt-28 rounded-card border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="mb-4 h-1 w-12 rounded-full bg-orangeAction" />
      <h2 className="text-base font-semibold text-ink">{card.title}</h2>
      {card.canvas ? (
        <div className="mt-4">
          <ImageCanvas label={card.title} compact />
        </div>
      ) : (
        <div className="mt-5 grid gap-3">
          <ContentSlot label={`${card.title} Panel`} />
          <div className="grid gap-2 rounded-card border border-stone-100 bg-warm p-4">
            <div className="h-2 w-3/4 rounded-full bg-stone-200" />
            <div className="h-2 w-1/2 rounded-full bg-stone-200" />
          </div>
        </div>
      )}
    </article>
  );
}
