import { ImageCanvas } from "@/components/image-canvas";
import { ContentSlot } from "@/components/content-slot";
import type { DashboardCard as DashboardCardType } from "@/types/site";

type DashboardCardProps = {
  card: DashboardCardType;
};

export function DashboardCard({ card }: DashboardCardProps) {
  return (
    <article className="rounded-card border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-ink">{card.title}</h2>
      {card.canvas ? (
        <div className="mt-4">
          <ImageCanvas label={card.title} compact />
        </div>
      ) : (
        <div className="mt-5">
          <ContentSlot label={`${card.title} Panel`} />
        </div>
      )}
    </article>
  );
}
