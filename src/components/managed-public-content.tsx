import Link from "next/link";
import { PageSection } from "@/components/page-section";
import { managedContent } from "@/lib/managed-content";
import { assets } from "@/lib/admin-assets";
export async function ManagedPublicContent() {
  const items = (await managedContent()).filter((item) => item.status === "published" && !(item.kind === "homepage" && item.slug === "about"));
  if (!items.length) return null;
  const media = await assets();
  return <PageSection><div className="grid gap-6 md:grid-cols-2">{items.map((item) => { const asset = media.find((asset) => asset.id === item.assetId && !asset.archived && !asset.clientId); return <article key={item.id} className="overflow-hidden rounded-card border border-ink/10 bg-white">{asset ? asset.mime.startsWith("video/") ? <video controls preload="metadata" className="aspect-video w-full bg-ink" aria-label={asset.title}><source src={`/api/managed-media/${asset.id}`} type={asset.mime} /></video> : <div className="aspect-video bg-cover bg-center" role="img" aria-label={asset.title} style={{ backgroundImage: `url('/api/managed-media/${asset.id}')` }} /> : null}<div className="p-6"><p className="text-xs uppercase tracking-widest text-orange-700">{item.kind}</p><h2 className="mt-3 text-2xl">{item.title}</h2><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-stone-600">{item.body}</p>{item.href ? <Link href={item.href} className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-orange-700">Read more</Link> : null}</div></article>; })}</div></PageSection>;
}
