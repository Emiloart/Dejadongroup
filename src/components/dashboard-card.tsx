import type { DashboardCard as DashboardCardType } from "@/types/site";

type DashboardCardProps = {
  card: DashboardCardType;
  id?: string;
};

export function DashboardCard({ card, id }: DashboardCardProps) {
  return (
    <article id={id} className="scroll-mt-8 border-t border-ink/10 py-6 sm:grid sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-6 lg:grid-cols-[185px_minmax(0,1fr)] lg:gap-8">
      <h3 className="text-lg font-medium leading-7 text-ink">{card.title}</h3>
      {card.fields?.length ? (
        <dl className="mt-4 grid gap-x-8 gap-y-3 sm:mt-0 md:grid-cols-2">
          {card.fields.map((field) => (
            <div key={field} className="flex min-w-0 items-start justify-between gap-4 text-sm leading-6">
              <dt className="min-w-0 text-stone-600">{field}</dt>
              <dd className="shrink-0 text-stone-400">
                <span aria-hidden="true">—</span>
                <span className="sr-only">Not available</span>
              </dd>
            </div>
          ))}
        </dl>
      ) : <p className="mt-3 text-sm text-stone-500 sm:mt-0">No details available.</p>}
    </article>
  );
}
