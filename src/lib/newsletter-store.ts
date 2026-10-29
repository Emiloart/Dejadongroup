import { randomUUID } from "node:crypto";
import { ContentError } from "@/lib/content-api";
import type { NewsletterSubscriber } from "@/lib/content-types";
import { readCollection, updateCollection } from "@/lib/site-storage";

export const getNewsletterSubscribers = () => readCollection<NewsletterSubscriber>("newsletter");

export function subscribeToNewsletter(input: Record<string, unknown>) {
  if (typeof input.website === "string" && input.website) return Promise.resolve(true);
  if (input.consent !== true) throw new ContentError("Please confirm that you would like to receive our updates.");
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ContentError("Enter a valid email address.");
  return updateCollection<NewsletterSubscriber, boolean>("newsletter", (items) => {
    if (items.some((item) => item.email === email)) return { items, result: true };
    return { items: [{ id: randomUUID(), email, subscribedAt: new Date().toISOString() }, ...items], result: true };
  });
}

export const removeNewsletterSubscriber = (id: string) => updateCollection<NewsletterSubscriber, boolean>("newsletter", (items) => {
  if (!items.some((item) => item.id === id)) throw new ContentError("Subscriber not found.", 404);
  return { items: items.filter((item) => item.id !== id), result: true };
});
