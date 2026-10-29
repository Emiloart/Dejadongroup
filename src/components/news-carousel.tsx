"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight, Newspaper } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { NewsArticle } from "@/lib/content-types";

export function ArticleImage({ article }: { article: NewsArticle }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [article.image]);
  return <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-agriculture/10">
    {article.image && !failed ? <Image src={article.image} alt={article.title} fill sizes="(max-width: 640px) 280px, 340px" unoptimized className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105" onError={() => setFailed(true)} /> : <Newspaper aria-hidden="true" className="h-10 w-10 text-agriculture/50" strokeWidth={1.25} />}
  </div>;
}

export function NewsCarousel({ articles }: { articles: NewsArticle[] }) {
  const id = useId();
  const track = useRef<HTMLUListElement>(null);
  const [position, setPosition] = useState({ index: 0, previous: false, next: false });
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () => {
      const max = element.scrollWidth - element.clientWidth;
      const cards = Array.from(element.children) as HTMLElement[];
      const index = max > 2 && element.scrollLeft >= max - 2 ? cards.length - 1 : cards.reduce((nearest, card, candidate) => Math.abs(card.offsetLeft - element.scrollLeft) < Math.abs(cards[nearest].offsetLeft - element.scrollLeft) ? candidate : nearest, 0);
      setPosition({ index, previous: element.scrollLeft > 2, next: element.scrollLeft < max - 2 });
    };
    update();
    element.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => { element.removeEventListener("scroll", update); observer.disconnect(); };
  }, [articles.length]);

  function show(index: number) {
    const element = track.current;
    const card = element?.children[Math.max(0, Math.min(index, articles.length - 1))] as HTMLElement | undefined;
    if (element && card) element.scrollTo({ left: card.offsetLeft, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  function step(direction: number) {
    const element = track.current;
    const first = element?.firstElementChild as HTMLElement | null;
    if (element && first) element.scrollBy({ left: direction * (first.offsetWidth + 24), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  return <section id="blogs-news" aria-labelledby="blogs-news-heading" className="bg-white">
    <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-agriculture">From our world</p>
          <h2 id="blogs-news-heading" className="mt-3 text-3xl tracking-tight sm:text-4xl">Blog & news</h2>
          <p className="mt-4 text-sm leading-7 text-stone-600">Stories, perspectives and updates from agriculture, land and the De Jadon Group community.</p>
        </div>
        {articles.length > 1 && (position.previous || position.next) ? <div className="flex gap-2">
          <button type="button" aria-label="Previous article" aria-controls={id} disabled={!position.previous} onClick={() => step(-1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 hover:border-orangeAction hover:text-orangeAction disabled:opacity-30"><ArrowLeft aria-hidden="true" className="h-4 w-4" /></button>
          <button type="button" aria-label="Next article" aria-controls={id} disabled={!position.next} onClick={() => step(1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 hover:border-orangeAction hover:text-orangeAction disabled:opacity-30"><ArrowRight aria-hidden="true" className="h-4 w-4" /></button>
        </div> : null}
      </div>
      {articles.length ? <>
        <p id={`${id}-help`} className="sr-only">Swipe or use the left and right arrow keys to browse articles.</p>
        <ul id={id} ref={track} aria-label="Blog and news articles" aria-roledescription="carousel" aria-describedby={`${id}-help`} tabIndex={position.previous || position.next ? 0 : undefined} className="relative flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); step(event.key === "ArrowRight" ? 1 : -1); }
          if (event.key === "Home" || event.key === "End") { event.preventDefault(); show(event.key === "Home" ? 0 : articles.length - 1); }
        }}>
          {articles.map((article) => <li key={article.id} className="w-[280px] max-w-[calc(100vw-3.5rem)] shrink-0 snap-start sm:w-[340px]">
            <article className="h-full overflow-hidden rounded-card border border-ink/10 bg-white">
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="group flex h-full flex-col focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-orangeAction">
                <ArticleImage article={article} />
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-agriculture">{article.kind === "blog" ? "Blog" : "News"} <span aria-hidden="true" className="px-1 text-stone-300">/</span> <span className="break-words font-normal normal-case tracking-normal text-stone-500">{article.siteName}</span></p>
                  <h3 className="mt-3 line-clamp-2 text-xl leading-snug text-ink group-hover:text-orangeAction">{article.title}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-600">{article.excerpt}</p>
                  <span className="mt-auto flex items-center gap-2 pt-5 text-sm font-semibold text-orangeAction">Read article <ArrowUpRight aria-hidden="true" className="h-4 w-4" /><span className="sr-only"> (opens in a new tab)</span></span>
                </div>
              </a>
            </article>
          </li>)}
        </ul>
        {position.previous || position.next ? <div className="mt-4 flex gap-1" aria-label="Choose an article">{articles.map((article, index) => <button key={article.id} type="button" aria-label={`Show ${article.title}`} aria-current={position.index === index ? "true" : undefined} aria-controls={id} onClick={() => show(index)} className="flex h-10 w-9 items-center justify-center rounded-card"><span aria-hidden="true" className={`h-1.5 rounded-full ${position.index === index ? "w-6 bg-agriculture" : "w-1.5 bg-ink/20"}`} /></button>)}</div> : null}
      </> : <div className="flex items-start gap-4 rounded-card border border-dashed border-ink/15 bg-warm/50 p-6 sm:p-8"><Newspaper aria-hidden="true" className="mt-1 h-6 w-6 shrink-0 text-agriculture" strokeWidth={1.5} /><div><h3 className="text-xl">More stories are on the way.</h3><p className="mt-2 text-sm leading-7 text-stone-600">Check back for our latest articles, or join the newsletter below to stay in touch.</p></div></div>}
    </div>
  </section>;
}
