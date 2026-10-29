import { randomUUID } from "node:crypto";
import { ContentError } from "@/lib/content-api";
import { maxNewsSlides, type NewsArticle } from "@/lib/content-types";
import { readCollection, updateCollection } from "@/lib/site-storage";
import { getArticlePreview } from "@/lib/article-preview";

export const getNewsArticles = () => readCollection<NewsArticle>("news");
export const getPublishedNews = async () => (await getNewsArticles()).filter((article) => article.published).slice(0, maxNewsSlides);

export async function addNewsArticle(url: unknown, kind: unknown, publish = true) {
  if (kind !== "blog" && kind !== "news") throw new ContentError("Choose blog or news.");
  if (publish && (await getPublishedNews()).length >= maxNewsSlides) throw new ContentError("All four carousel spaces are filled. Hide or remove an article first.", 409);
  const preview = await getArticlePreview(url);
  return updateCollection<NewsArticle, NewsArticle>("news", (items) => {
    if (publish && items.filter((item) => item.published).length >= maxNewsSlides) throw new ContentError("All four carousel spaces are filled. Hide or remove an article first.", 409);
    if (items.some((item) => item.url === preview.url)) throw new ContentError("This article has already been added.", 409);
    const article: NewsArticle = { ...preview, id: randomUUID(), kind, published: publish, createdAt: new Date().toISOString() };
    return { items: [...items, article], result: article };
  });
}

export async function updateNewsArticle(id: string, action: unknown) {
  const current = (await getNewsArticles()).find((item) => item.id === id);
  if (!current) throw new ContentError("Article not found.", 404);
  const refreshed = action === "refresh" ? await getArticlePreview(current.url) : null;
  return updateCollection<NewsArticle, NewsArticle[]>("news", (items) => {
    const index = items.findIndex((item) => item.id === id);
    if (index < 0) throw new ContentError("Article not found.", 404);
    const article = items[index];
    if (action === "refresh" && refreshed) items[index] = { ...article, ...refreshed };
    else if (action === "archive") items[index] = { ...article, published: false, archived: true };
    else if (action === "hide") items[index] = { ...article, published: false };
    else if (action === "publish") {
      if (!article.published && items.filter((item) => item.published).length >= maxNewsSlides) throw new ContentError("The carousel already contains four articles.", 409);
      items[index] = { ...article, published: true, archived: false };
    } else if (action === "up" || action === "down") {
      const other = index + (action === "up" ? -1 : 1);
      if (other >= 0 && other < items.length) [items[index], items[other]] = [items[other], items[index]];
    } else throw new ContentError("Choose a valid article action.");
    return { items, result: items };
  });
}

export const removeNewsArticle = async (id: string) => { await updateNewsArticle(id, "archive"); return true; };
