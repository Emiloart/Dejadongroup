import { BusinessCard } from "@/components/business-card";
import type { Business } from "@/types/site";

export function BusinessCarousel({ businesses }: { businesses: Business[] }) {
  return (
    <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
      {businesses.map((business) => <BusinessCard key={business.slug} business={business} />)}
    </div>
  );
}
