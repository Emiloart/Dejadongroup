import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { DashboardFeature } from "@/lib/dashboard-data";

type DashboardCardProps = {
  card: DashboardFeature;
  id?: string;
};

export function DashboardCard({ card, id }: DashboardCardProps) {
  return (
    <article id={id} className="scroll-mt-28 border-t border-ink/10 py-5 sm:flex sm:items-start sm:justify-between sm:gap-8">
      <div className="min-w-0">
        <h3 className="text-base font-semibold leading-7 text-ink">{card.title}</h3>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-stone-600">{card.description}</p>
      </div>
      {card.href && card.action ? (
        <Link href={card.href} className="mt-3 inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-orangeAction hover:text-orange-700 sm:mt-1">
          {card.action} <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      ) : (
        <span className="mt-3 inline-block shrink-0 text-xs font-medium text-stone-500 sm:mt-2">Awaiting connection</span>
      )}
    </article>
  );
}
