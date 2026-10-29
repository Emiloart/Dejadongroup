"use client";

import { ArrowDown, ArrowUp, ArrowUpRight, Link2, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArticleImage } from "@/components/news-carousel";
import { maxNewsSlides, type NewsArticle } from "@/lib/content-types";

const button = "inline-flex min-h-11 items-center justify-center gap-2 rounded-card px-4 text-sm font-semibold transition-colors disabled:opacity-40";

export function AdminNewsManager({ initialArticles, permissions }: { initialArticles: NewsArticle[]; permissions: import("@/lib/admin-permissions").Permission[] }) {
  const canPublish = permissions.includes("content.publish"); const canCreate = permissions.includes("content.create"); const canEdit = permissions.includes("content.update");
  const router = useRouter();
  const [articles, setArticles] = useState(initialArticles);
  const [url, setUrl] = useState("");
  const [kind, setKind] = useState("blog");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const published = articles.filter((article) => article.published).length;

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy("add"); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/news", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url, kind }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We couldn’t import this article.");
      setArticles((current) => [...current, result.article]);
      setUrl("");
      setNotice(!result.article.published ? "Article imported as a draft for publication review." : result.article.image ? "Article added to the homepage with its original image and opening excerpt." : "Article added. This source did not provide a usable preview image.");
      router.refresh();
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Please try again."); }
    finally { setBusy(null); }
  }

  async function update(article: NewsArticle, action: string) {
    if (busy) return;
    setBusy(article.id); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/admin/news/${article.id}`, { method: action === "remove" ? "DELETE" : "PUT", headers: { "Content-Type": "application/json" }, ...(action !== "remove" ? { body: JSON.stringify({ action }) } : {}) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We couldn’t update this article.");
      setArticles((current) => action === "remove" ? current.map((item) => item.id === article.id ? { ...item, archived: true, published: false } : item) : result.articles);
      setConfirmRemove(null);
      setNotice(action === "refresh" ? "The article image, title and excerpt have been refreshed from the source." : "Homepage articles updated.");
      router.refresh();
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Please try again."); }
    finally { setBusy(null); }
  }

  return <div>
    <div className="flex flex-wrap items-start justify-between gap-5"><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">Website stories</p><h1 className="mt-3 text-4xl tracking-tight sm:text-5xl">Blog & news</h1><p className="mt-4 text-sm leading-7 text-stone-600">Import an article link with its original image, title and opening lines. Editors save drafts; publishers control homepage visibility. The carousel holds up to four published articles.</p></div><a href="/#blogs-news" target="_blank" rel="noopener noreferrer" className={`${button} border border-ink/20 hover:bg-white`}>View on website <ArrowUpRight aria-hidden="true" className="h-4 w-4" /></a></div>
    <form onSubmit={add} className="mt-8 rounded-card border border-ink/10 bg-white p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl">Add an article link</h2><span className="rounded-full bg-agriculture/10 px-3 py-1 text-xs font-semibold text-agriculture">{published} of {maxNewsSlides} spaces filled</span></div>
      <p className="mt-2 text-sm leading-6 text-stone-600">Images are taken from the linked article automatically.</p>
      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_150px_auto] lg:items-end">
        <div className="min-w-0"><label htmlFor="article-url" className="text-sm font-semibold">Article link</label><input id="article-url" type="url" required maxLength={2048} placeholder="https://example.com/your-article" value={url} onChange={(event) => setUrl(event.target.value)} disabled={!!busy || !canCreate || canPublish && published >= maxNewsSlides} className="mt-2 min-h-12 w-full min-w-0 rounded-card border border-ink/20 px-3 text-base disabled:bg-stone-50 sm:text-sm" /></div>
        <div><label htmlFor="article-kind" className="text-sm font-semibold">Section</label><select id="article-kind" value={kind} onChange={(event) => setKind(event.target.value)} disabled={!!busy || !canCreate || canPublish && published >= maxNewsSlides} className="mt-2 min-h-12 w-full rounded-card border border-ink/20 bg-white px-3 text-base sm:text-sm"><option value="blog">Blog</option><option value="news">News</option></select></div>
        <button type="submit" disabled={!!busy || !canCreate || canPublish && published >= maxNewsSlides} className={`${button} min-h-12 bg-ink text-white hover:bg-stone-700`}>{busy === "add" ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Link2 aria-hidden="true" className="h-4 w-4" />}{busy === "add" ? "Reading article…" : canPublish ? "Add to carousel" : "Import draft"}</button>
      </div>
      {published >= maxNewsSlides ? <p className="mt-4 text-sm leading-6 text-stone-600">The carousel is full. Hide or remove an existing article to add a new one.</p> : null}
    </form>
    {error ? <p role="alert" className="mt-5 rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}
    {notice ? <p role="status" className="mt-5 rounded-card border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">{notice}</p> : null}
    <section aria-label="Managed articles" className="mt-8 space-y-4">
      {articles.length ? articles.map((article, index) => <article key={article.id} className="rounded-card border border-ink/10 bg-white p-5">
        <div className="grid gap-5 sm:grid-cols-[160px_minmax(0,1fr)]"><div className="overflow-hidden rounded-card"><ArticleImage article={article} /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2 text-xs"><span className={`rounded-full px-2.5 py-1 font-semibold ${article.published ? "bg-green-50 text-green-800" : "bg-stone-100 text-stone-600"}`}>{article.published ? "Published" : article.archived ? "Archived" : "Draft / hidden"}</span><span className="text-stone-500">{article.kind === "blog" ? "Blog" : "News"} · {article.siteName}</span></div><h2 className="mt-3 text-xl">{article.title}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-600">{article.excerpt}</p><a href={article.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex max-w-full min-h-9 items-center gap-1 text-xs text-orange-700 hover:underline"><span className="truncate">{article.url}</span><ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0" /></a></div></div>
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-ink/10 pt-3">
          <button type="button" disabled={!!busy || !canPublish || !article.published && published >= maxNewsSlides} onClick={() => void update(article, article.published ? "hide" : "publish")} className={`${button} border border-ink/15 hover:bg-warm`}>{article.published ? "Hide article" : "Publish article"}</button>
          <button type="button" disabled={!!busy || !(article.published ? canPublish : canEdit)} onClick={() => void update(article, "refresh")} className={`${button} text-stone-600 hover:text-ink`}><RefreshCw aria-hidden="true" className={`h-4 w-4 ${busy === article.id ? "animate-spin" : ""}`} />Refresh from link</button>
          <div className="flex gap-1 sm:ml-auto"><button type="button" aria-label={`Move ${article.title} earlier`} disabled={!!busy || !canPublish || index === 0} onClick={() => void update(article, "up")} className="flex h-11 w-11 items-center justify-center rounded-card border border-ink/15 disabled:opacity-30"><ArrowUp aria-hidden="true" className="h-4 w-4" /></button><button type="button" aria-label={`Move ${article.title} later`} disabled={!!busy || !canPublish || index === articles.length - 1} onClick={() => void update(article, "down")} className="flex h-11 w-11 items-center justify-center rounded-card border border-ink/15 disabled:opacity-30"><ArrowDown aria-hidden="true" className="h-4 w-4" /></button></div>
          {confirmRemove === article.id ? <div className="flex flex-wrap items-center gap-3 text-xs"><span>Archive this article?</span><button type="button" disabled={!!busy} onClick={() => void update(article, "remove")} className="min-h-11 font-semibold text-red-700">Archive</button><button type="button" onClick={() => setConfirmRemove(null)} className="min-h-11 font-semibold">Cancel</button></div> : <button type="button" aria-label={`Remove ${article.title}`} disabled={!!busy || !canEdit || article.published && !canPublish} onClick={() => setConfirmRemove(article.id)} className="flex h-11 w-11 items-center justify-center rounded-card text-stone-500 hover:bg-red-50 hover:text-red-700"><Trash2 aria-hidden="true" className="h-4 w-4" /></button>}
        </div>
      </article>) : <div className="rounded-card border border-dashed border-ink/20 p-8 text-center"><Link2 aria-hidden="true" className="mx-auto h-8 w-8 text-agriculture" /><h2 className="mt-4 text-2xl">Your first story starts with a link.</h2><p className="mt-3 text-sm leading-7 text-stone-600">Add a public blog or news article above. A publisher can make its preview visible on the homepage.</p></div>}
    </section>
  </div>;
}
