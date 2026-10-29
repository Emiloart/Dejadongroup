const assert = require("node:assert/strict");
const fs = require("node:fs");
const { mkdtemp, rm } = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const Module = require("node:module");
const { test } = require("node:test");
const ts = require("typescript");

// Load the server's TypeScript modules without a test-only runtime dependency.
const resolve = Module._resolveFilename;
Module._resolveFilename = function (name, ...args) {
  return resolve.call(this, name.startsWith("@/") ? path.join(process.cwd(), "src", name.slice(2)) : name, ...args);
};
Module._extensions[".ts"] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true }
}).outputText, filename);

const preview = require("../src/lib/article-preview.ts");
const news = require("../src/lib/news-store.ts");
const newsletter = require("../src/lib/newsletter-store.ts");

test("article imports use source images and opening text without rendering source HTML", () => {
  const article = preview.extractArticlePreview(`<!doctype html><html><head>
    <meta property="og:title" content="A farm &amp; its future">
    <meta property="og:description" content="A metadata fallback description.">
    <meta property="og:image" content="/photos/farm.jpg"><meta property="og:site_name" content="Farm Journal">
    </head><body><nav><p>Ignore navigation text even when it is longer than fifty characters.</p></nav>
    <article><script>window.secret = 'never render this';</script><h1>Article title</h1>
    <p>The opening paragraph explains how productive land supports our farms and the people who work on them.</p>
    <p>A later paragraph should not replace the beginning of the article.</p></article></body></html>`, new URL("https://example.com/blog/farm"));
  assert.equal(article.title, "A farm & its future");
  assert.equal(article.image, "https://example.com/photos/farm.jpg");
  assert.equal(article.siteName, "Farm Journal");
  assert.match(article.excerpt, /^The opening paragraph/);
  assert.doesNotMatch(article.excerpt, /secret|navigation|metadata|later paragraph/);
  const fallback = preview.extractArticlePreview('<title>News story</title><meta name="description" content="A public news story description."><main><img src="/original-image.jpg"></main>', new URL("https://example.com/story"));
  assert.equal(fallback.image, "https://example.com/original-image.jpg");
  assert.equal(fallback.excerpt, "A public news story description.");
});

test("article URLs block internal services and non-web schemes", async () => {
  for (const url of ["http://localhost/test", "http://127.0.0.1", "http://2130706433", "http://10.0.0.1", "http://169.254.169.254/latest", "http://100.64.0.1", "http://[::1]", "http://[::ffff:127.0.0.1]", "http://[fc00::1]", "http://[64:ff9b::7f00:1]", "https://example.com:3000", "file:///etc/passwd", "javascript:alert(1)", "https://user:password@example.com"]) {
    await assert.rejects(preview.getArticlePreview(url), /public|HTTP|complete/);
  }
  assert.equal(preview.articleUrl("https://example.com/story#section").href, "https://example.com/story");
});

test("public-looking hostnames cannot resolve to private services", async () => {
  const dns = require("node:dns/promises");
  const originalLookup = dns.lookup;
  try {
    for (const addresses of [
      [{ address: "127.0.0.1", family: 4 }],
      [{ address: "8.8.8.8", family: 4 }, { address: "169.254.169.254", family: 4 }],
      [{ address: "::ffff:10.0.0.1", family: 6 }]
    ]) {
      dns.lookup = async () => addresses;
      await assert.rejects(preview.getArticlePreview("https://public-looking.example/article"), /public article/);
    }
  } finally { dns.lookup = originalLookup; }
});

test("four published articles, ordering, refresh, hiding and persistent newsletter signups", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "dejadon-content-unit-"));
  const previousDirectory = process.env.DEJADON_DATA_DIR;
  const originalPreview = preview.getArticlePreview;
  process.env.DEJADON_DATA_DIR = directory;
  let refreshed = false;
  preview.getArticlePreview = async (url) => ({ url, title: refreshed ? "Refreshed article" : `Story ${url.split("/").pop()}`, excerpt: "An opening excerpt from the source article.", image: "https://example.com/original.jpg", siteName: "Original source" });
  try {
    const results = await Promise.allSettled(Array.from({ length: 5 }, (_, index) => news.addNewsArticle(`https://example.com/${index}`, "blog")));
    assert.equal(results.filter((result) => result.status === "fulfilled").length, 4);
    assert.equal(results.filter((result) => result.status === "rejected").length, 1);
    assert.equal((await news.getPublishedNews()).length, 4);
    let items = await news.getNewsArticles();
    const first = items[0];
    await news.updateNewsArticle(first.id, "down");
    assert.equal((await news.getNewsArticles())[1].id, first.id);
    await news.updateNewsArticle(first.id, "hide");
    assert.equal((await news.getPublishedNews()).length, 3);
    const added = await news.addNewsArticle("https://example.com/another", "news");
    await assert.rejects(news.updateNewsArticle(first.id, "publish"), /four/);
    refreshed = true;
    await news.updateNewsArticle(added.id, "refresh");
    assert.equal((await news.getNewsArticles()).find((item) => item.id === added.id).title, "Refreshed article");
    await news.removeNewsArticle(added.id);
    await news.updateNewsArticle(first.id, "publish");
    assert.equal((await news.getPublishedNews()).length, 4);
    await assert.rejects(news.addNewsArticle(first.url, "blog"), /four/);
    await newsletter.subscribeToNewsletter({ email: "Person@Example.com", consent: true });
    await newsletter.subscribeToNewsletter({ email: "person@example.com", consent: true });
    assert.throws(() => newsletter.subscribeToNewsletter({ email: "person@example.com", consent: false }), /confirm/);
    assert.throws(() => newsletter.subscribeToNewsletter({ email: "invalid", consent: true }), /valid email/);
    await newsletter.subscribeToNewsletter({ email: "bot@example.com", consent: true, website: "bot" });
    const subscribers = await newsletter.getNewsletterSubscribers();
    assert.equal(subscribers.length, 1);
    assert.equal(subscribers[0].email, "person@example.com");
    assert.ok(subscribers[0].subscribedAt);
    assert.equal(JSON.parse(fs.readFileSync(path.join(directory, "newsletter.json"), "utf8")).items.length, 1);
    await newsletter.removeNewsletterSubscriber(subscribers[0].id);
    assert.equal((await newsletter.getNewsletterSubscribers()).length, 0);
  } finally {
    preview.getArticlePreview = originalPreview;
    if (previousDirectory === undefined) delete process.env.DEJADON_DATA_DIR;
    else process.env.DEJADON_DATA_DIR = previousDirectory;
    await rm(directory, { recursive: true, force: true });
  }
});
