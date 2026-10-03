import type { DashboardCard as DashboardCardType } from "@/types/site";

type DashboardCardProps = {
  card: DashboardCardType;
  id?: string;
};

export function DashboardCard({ card, id }: DashboardCardProps) {
  return (
    <article
      id={id}
      className={`scroll-mt-24 border-t border-stone-200 py-6 ${
        card.wide ? "lg:col-span-2" : ""
      }`}
    >
      <h3 className="text-lg font-semibold text-ink">{card.title}</h3>
      {card.fields ? (
        <dl className="mt-4 divide-y divide-stone-200/60">
          {card.fields.map((field) => (
            <div key={field} className="flex items-baseline justify-between gap-6 py-3 text-sm">
              <dt className="text-stone-600">{field}</dt>
              <dd className="shrink-0 text-stone-400">
                <span aria-hidden="true">—</span>
                <span className="sr-only">Not available</span>
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      {!card.fields ? (
        <p className="mt-4 text-sm text-stone-500">No details available.</p>
      ) : null}
    </article>
  );
}
