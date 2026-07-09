"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { BusinessCard } from "@/components/business-card";
import type { Business } from "@/types/site";

type BusinessCarouselProps = {
  businesses: Business[];
};

export function BusinessCarousel({ businesses }: BusinessCarouselProps) {
  const [activeBusiness, setActiveBusiness] = useState(0);

  function showPrevious() {
    setActiveBusiness((current) => (current === 0 ? businesses.length - 1 : current - 1));
  }

  function showNext() {
    setActiveBusiness((current) => (current === businesses.length - 1 ? 0 : current + 1));
  }

  return (
    <section className="overflow-hidden rounded-card border border-orangeAction/20 bg-white p-3 shadow-sm sm:p-4">
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${activeBusiness * 100}%)` }}
      >
        {businesses.map((business) => (
          <div key={business.slug} className="min-w-full">
            <BusinessCard business={business} />
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {businesses.map((business, index) => (
            <button
              key={business.slug}
              type="button"
              aria-label={`Show ${business.name}`}
              className={`h-2.5 rounded-full transition-all ${
                activeBusiness === index ? "w-9 bg-orangeAction" : "w-2.5 bg-orangeAction/25 hover:bg-orangeAction/50"
              }`}
              onClick={() => setActiveBusiness(index)}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous business"
            className="rounded-card border border-orangeAction/25 p-2 text-orangeAction hover:bg-orange-50"
            onClick={showPrevious}
          >
            <ChevronLeft aria-hidden="true" className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next business"
            className="rounded-card border border-orangeAction/25 p-2 text-orangeAction hover:bg-orange-50"
            onClick={showNext}
          >
            <ChevronRight aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
