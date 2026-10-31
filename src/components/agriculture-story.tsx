import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ContentPhoto } from "@/components/content-photo";

const priorities = [
  {
    title: "A dependable food supply",
    body: "Food supply depends on productive farms. Our crop work includes palm, pepper and cassava, alongside poultry and fishery. These activities keep food production at the heart of our business, from cultivated crops to sources of animal protein.",
    href: "/businesses/agriculture/crop-farming",
    link: "Explore our crops"
  },
  {
    title: "The pressure of feed costs",
    body: "Farmers need suitable feed as well as healthy livestock, and feed costs can put pressure on fish production. Our agricultural work includes Black Soldier Fly farming. The larvae can serve as a protein ingredient in animal feed.",
    href: "/businesses/agriculture/livestock/bsf",
    link: "Discover BSF farming"
  },
  {
    title: "The knowledge to get started",
    body: "Land alone does not make a productive farm. Crop choice, planning and day-to-day care matter too. Our wider group offers agricultural consultancy and farm development for people exploring the practical steps involved in starting a farm.",
    href: "/contact",
    link: "Speak with our team"
  }
];

export function AgricultureStory() {
  return <article aria-labelledby="agriculture-story-title">
    <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
      <div className="max-w-xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-agriculture">Why agriculture matters</p>
        <h2 id="agriculture-story-title" className="max-w-md text-3xl font-medium leading-[1.12] tracking-tight sm:text-4xl">The work behind every meal.</h2>
        <p className="mt-5 text-base leading-8 text-stone-700">Before food reaches a kitchen, someone has prepared the land, tended a crop or cared for livestock. Agriculture supports the people who grow our food and the traders, processors and families whose livelihoods depend on each harvest.</p>
        <p className="mt-4 text-base leading-8 text-stone-700">For us, strengthening agriculture starts with practical work: growing food, caring for livestock and understanding the resources that make production possible.</p>
      </div>
      <figure className="min-w-0">
        <ContentPhoto name="agricultureEditorial" aspectRatio={3 / 2} sizes="(min-width: 1280px) 580px, (min-width: 1024px) 46vw, (min-width: 640px) 90vw, 100vw" />
        <figcaption className="mt-3 text-xs leading-5 text-stone-500">An illustration of the connections between crops, livestock and food production.</figcaption>
      </figure>
    </div>
    <div className="mt-10 grid gap-7 border-t border-ink/10 pt-8 sm:mt-12 md:grid-cols-3 md:gap-8">
      {priorities.map((priority) => <section key={priority.title} className="flex min-w-0 flex-col">
        <h3 className="text-xl font-medium leading-snug text-ink">{priority.title}</h3>
        <p className="mb-3 mt-3 text-sm leading-7 text-stone-600">{priority.body}</p>
        <Link href={priority.href} className="mt-auto inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-agriculture hover:text-orange-700">{priority.link}<ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0" /></Link>
      </section>)}
    </div>
    <details className="mt-6 border-t border-ink/10 pt-4 text-xs leading-6 text-stone-500">
      <summary className="min-h-11 cursor-pointer content-center font-semibold text-stone-600">Further reading</summary>
      <ul className="mt-2 space-y-2">
        <li><a href="https://www.fao.org/cfs/policy-products/voluntary-guidelines-and-policy-recommendations/sustainable-agricultural-development-for-food-security-and-nutrition--what-roles-for-livestock" target="_blank" rel="noreferrer" className="underline decoration-stone-300 underline-offset-4 hover:text-agriculture">FAO: agriculture, food security and livelihoods</a></li>
        <li><a href="https://www.worldfishcenter.org/blog/listening-feed-system-field-insights-nigeria" target="_blank" rel="noreferrer" className="underline decoration-stone-300 underline-offset-4 hover:text-agriculture">WorldFish: the challenge of fish feed in Nigeria</a></li>
        <li><a href="https://www.fao.org/4/i3253e/i3253e.pdf" target="_blank" rel="noreferrer" className="underline decoration-stone-300 underline-offset-4 hover:text-agriculture">FAO: the potential of insects as food and feed (PDF)</a></li>
      </ul>
    </details>
  </article>;
}
