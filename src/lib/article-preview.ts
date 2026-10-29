import { lookup } from "node:dns/promises";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { isIP } from "node:net";
import { load } from "cheerio/slim";
import ipaddr from "ipaddr.js";
import { ContentError } from "@/lib/content-api";

export function articleUrl(value: unknown, base?: string) {
  if (typeof value !== "string" || !value.trim() || value.length > 2048) throw new ContentError("Enter a public blog or news article link.");
  let url: URL;
  try { url = new URL(value.trim(), base); } catch { throw new ContentError("Enter a complete article link beginning with https://."); }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || (url.port && !["80", "443"].includes(url.port))) throw new ContentError("Use a public HTTP or HTTPS article link.");
  const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local") || !hostname.includes(".") && !isIP(hostname)) throw new ContentError("Use a public article link.");
  if (isIP(hostname) && ipaddr.process(hostname).range() !== "unicast") throw new ContentError("Use a public article link.");
  url.hash = "";
  return url;
}

async function publicAddress(url: URL, timeout: number) {
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const addresses = await Promise.race([
      lookup(hostname, { all: true, verbatim: true }),
      new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new ContentError("The article took too long to respond. Try again.")), timeout); })
    ]);
    if (!addresses.length || addresses.some((address) => ipaddr.process(address.address).range() !== "unicast")) throw new ContentError("Use a public article link.");
    return addresses.find((address) => address.family === 4) || addresses[0];
  } finally { if (timer) clearTimeout(timer); }
}

async function fetchHtml(url: URL, deadline: number): Promise<{ html?: string; redirect?: string }> {
  const address = await publicAddress(url, Math.max(1, deadline - Date.now()));
  return new Promise((resolve, reject) => {
    const send = url.protocol === "https:" ? httpsRequest : httpRequest;
    // Connect to the validated address directly so a second DNS lookup cannot
    // redirect this request to a private service. TLS still checks the source host.
    const request = send({
      protocol: url.protocol, hostname: address.address, family: address.family,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      servername: isIP(url.hostname.replace(/^\[|\]$/g, "")) ? undefined : url.hostname,
      path: `${url.pathname}${url.search}`, agent: false, maxHeaderSize: 32768,
      headers: { Host: url.host, Accept: "text/html,application/xhtml+xml", "Accept-Encoding": "identity", "User-Agent": "DeJadonGroup-LinkPreview/1.0" }
    }, (response) => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode || 0) && response.headers.location) {
        resolve({ redirect: response.headers.location });
        response.destroy();
        return;
      }
      if (!response.statusCode || response.statusCode >= 400) {
        response.destroy();
        reject(new ContentError("This site could not provide an article preview. Check the link or try another public article.", 422));
        return;
      }
      if (!/text\/html|application\/xhtml\+xml/i.test(response.headers["content-type"] || "")) {
        response.destroy();
        reject(new ContentError("That link is not a blog or news webpage.", 422));
        return;
      }
      const chunks: Buffer[] = [];
      let length = 0;
      response.on("data", (chunk: Buffer) => {
        length += chunk.length;
        if (length > 2 * 1024 * 1024) {
          response.destroy();
          reject(new ContentError("This article is too large to preview. Try another article link.", 422));
        } else chunks.push(chunk);
      });
      response.on("end", () => resolve({ html: Buffer.concat(chunks).toString("utf8") }));
      response.on("error", reject);
    });
    const timer = setTimeout(() => request.destroy(new ContentError("The article took too long to respond. Try again.", 422)), Math.max(1, deadline - Date.now()));
    request.on("error", reject);
    request.on("close", () => clearTimeout(timer));
    request.end();
  });
}

const text = (value: string) => value.replace(/\s+/g, " ").trim();

export function extractArticlePreview(html: string, url: URL) {
  const $ = load(html);
  const meta = (key: string) => text($(`meta[property="${key}"],meta[name="${key}"]`).first().attr("content") || "");
  const title = (meta("og:title") || meta("twitter:title") || text($("h1").first().text()) || text($("title").first().text())).slice(0, 200);
  const siteName = (meta("og:site_name") || url.hostname.replace(/^www\./, "")).slice(0, 100);
  const metadataExcerpt = meta("og:description") || meta("twitter:description") || meta("description");
  $("script,style,noscript,nav,header,footer,form,aside,[aria-hidden='true']").remove();
  const articleBody = $("article, [itemprop='articleBody']").first();
  const paragraphs = (articleBody.length ? articleBody.find("p") : $("main p")).toArray().map((node) => text($(node).text())).filter((value) => value.length >= 50);
  const opening = paragraphs[0] || metadataExcerpt;
  const words = opening.split(/\s+/).filter(Boolean);
  const excerpt = words.length > 45 ? `${words.slice(0, 45).join(" ")}…` : opening;
  const articleImage = $("article img,main img,[itemprop='articleBody'] img").toArray().map((node) => $(node).attr("data-src") || $(node).attr("src")).find((src) => src && !src.startsWith("data:"));
  const imageValue = meta("og:image:secure_url") || meta("og:image") || meta("twitter:image") || articleImage;
  let image: string | null = null;
  if (imageValue) { try { image = articleUrl(imageValue, url.href).href; } catch { /* Source did not provide a usable public image. */ } }
  if (!title || !excerpt) throw new ContentError("This page did not provide a readable article preview. Try the article’s public link.", 422);
  return { url: url.href, title, excerpt: excerpt.slice(0, 600), siteName, image };
}

export async function getArticlePreview(value: unknown) {
  let url = articleUrl(value);
  const deadline = Date.now() + 12000;
  try {
    for (let redirects = 0; redirects <= 3; redirects++) {
      const response = await fetchHtml(url, deadline);
      if (response.redirect) { url = articleUrl(response.redirect, url.href); continue; }
      const preview = extractArticlePreview(response.html || "", url);
      if (preview.image) {
        try { await publicAddress(new URL(preview.image), 3000); } catch { preview.image = null; }
      }
      return preview;
    }
    throw new ContentError("This link redirects too many times. Use the article’s direct link.", 422);
  } catch (error) {
    if (error instanceof ContentError) throw error;
    throw new ContentError("We couldn’t read this article. Check that it is public and try again.", 422);
  }
}
