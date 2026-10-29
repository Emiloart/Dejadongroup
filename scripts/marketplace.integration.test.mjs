// Run after npm run build. Uses an isolated temporary catalogue and administrator.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer } from "node:net";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

test("protected product publishing, uploads, persistence, and draft isolation", { timeout: 120000 }, async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "dejadon-marketplace-test-"));
  const email = "catalogue-test@example.test";
  const password = randomBytes(24).toString("hex");
  const reservation = createServer();
  await new Promise((resolve) => reservation.listen(0, "127.0.0.1", resolve));
  const port = reservation.address().port;
  await new Promise((resolve) => reservation.close(resolve));
  const origin = `http://127.0.0.1:${port}`;
  let server;
  let output = "";
  async function start() {
    output = "";
    server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
      env: { ...process.env, ADMIN_EMAIL: email, ADMIN_PASSWORD: password, DEJADON_DATA_DIR: directory },
      stdio: ["ignore", "pipe", "pipe"]
    });
    server.stdout.on("data", (data) => { output += data; });
    server.stderr.on("data", (data) => { output += data; });
    for (let attempt = 0; attempt < 80; attempt++) {
      if (server.exitCode !== null) throw new Error(`Server exited: ${output}`);
      try { if ((await fetch(`${origin}/marketplace`)).ok) return; } catch {}
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    throw new Error(`Server did not start: ${output}`);
  }
  async function stop() {
    if (!server || server.exitCode !== null) return;
    const stopped = new Promise((resolve) => server.once("exit", resolve));
    server.kill();
    await stopped;
  }
  const photo = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64");
  function form(overrides = {}) {
    const values = {
      name: "Test crop pack", category: "crops", summary: "Fresh produce in a sealed pack.",
      description: "Pack contents and collection details.\nPlease store in a cool place.",
      price: "1500.50", unit: "pack", imageAlt: "A sealed produce pack", status: "draft", availability: "in-stock", ...overrides
    };
    const body = new FormData();
    for (const [key, value] of Object.entries(values)) body.set(key, value);
    return body;
  }
  let cookie;
  const request = (url, options = {}) => fetch(`${origin}${url}`, { ...options, headers: { Origin: origin, ...(cookie ? { Cookie: cookie } : {}), ...options.headers } });
  try {
    await start();
    assert.equal((await request("/api/admin/products")).status, 401);
    assert.equal((await request("/api/admin/products", { method: "POST", body: form() })).status, 401);
    assert.match(await (await request("/admin/products")).text(), /Welcome back/);
    assert.match(await (await request("/admin")).text(), /Welcome back/);
    const signIn = (details, headers) => request("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(details) });
    assert.equal((await signIn({ email, password }, { Origin: "https://another-site.test" })).status, 403);
    assert.equal((await signIn({ email, password: "incorrect" })).status, 401);
    const session = await signIn({ email, password });
    assert.equal(session.status, 200);
    const setCookie = session.headers.get("set-cookie");
    assert.match(setCookie, /HttpOnly/i);
    assert.match(setCookie, /SameSite=Lax/i);
    cookie = setCookie.split(";")[0];
    assert.match(await (await request("/admin")).text(), /Sales &amp; Marketplace/);
    const initial = await (await request("/api/admin/products")).json();
    assert.equal(initial.products.length, 4);

    const draftForm = form();
    draftForm.set("image", new Blob([photo], { type: "image/png" }), "photo.png");
    const created = await request("/api/admin/products", { method: "POST", body: draftForm });
    assert.equal(created.status, 201);
    const { product } = await created.json();
    assert.equal(product.status, "draft");
    assert.equal(product.price, 1500.5);
    assert.match(product.image, /^\/api\/media\/[0-9a-f-]+\.png$/);
    assert.equal((await request(`/marketplace/${product.slug}`)).status, 404);
    assert.doesNotMatch(await (await request("/marketplace")).text(), /Test crop pack/);
    const image = await request(product.image);
    assert.equal(image.headers.get("content-type"), "image/png");
    assert.equal(image.headers.get("x-content-type-options"), "nosniff");
    assert.deepEqual(Buffer.from(await image.arrayBuffer()), photo);

    assert.equal((await request(`/api/admin/products/${product.slug}`, { method: "PUT", body: form({ status: "published" }), headers: { Origin: "https://another-site.test" } })).status, 403);
    const published = await request(`/api/admin/products/${product.slug}`, { method: "PUT", body: form({ status: "published" }) });
    assert.equal(published.status, 200);
    assert.equal((await published.json()).product.image, product.image);
    const publicPage = await request(`/marketplace/${product.slug}`);
    assert.equal(publicPage.status, 200);
    const html = await publicPage.text();
    assert.match(html, /Test crop pack/);
    assert.match(html, /1,500\.50/);
    assert.match(html, /Pack contents and collection details/);
    assert.match(await (await request("/marketplace?category=crops")).text(), /Test crop pack/);
    assert.doesNotMatch(await (await request("/marketplace?category=fish")).text(), /Test crop pack/);

    assert.equal((await request("/api/admin/products", { method: "POST", body: form({ price: "-1" }) })).status, 400);
    const badImage = form();
    badImage.set("image", new Blob(["not an image"], { type: "image/png" }), "bad.png");
    assert.equal((await request("/api/admin/products", { method: "POST", body: badImage })).status, 400);
    const oversized = form();
    oversized.set("image", new Blob([Buffer.alloc(5 * 1024 * 1024 + 1)], { type: "image/png" }), "large.png");
    assert.equal((await request("/api/admin/products", { method: "POST", body: oversized })).status, 400);

    const concurrent = await Promise.all([1, 2].map(() => request("/api/admin/products", { method: "POST", body: form({ name: "Same product name" }) })));
    assert.deepEqual(concurrent.map((result) => result.status), [201, 201]);
    const slugs = await Promise.all(concurrent.map(async (result) => (await result.json()).product.slug));
    assert.equal(new Set(slugs).size, 2);
    const saved = JSON.parse(await readFile(path.join(directory, "products.json"), "utf8"));
    assert.equal(saved.products.length, 7);

    await stop();
    await start();
    assert.equal((await request(`/marketplace/${product.slug}`)).status, 200, "products persist across a server restart");
    const archived = await request(`/api/admin/products/${product.slug}`, { method: "PUT", body: form({ status: "draft", price: "0", removeImage: "true" }) });
    assert.equal(archived.status, 200);
    const updated = (await archived.json()).product;
    assert.equal(updated.price, 0);
    assert.equal(updated.image, null);
    assert.equal((await request(`/marketplace/${product.slug}`)).status, 404);
    assert.doesNotMatch(await (await request("/marketplace")).text(), /Test crop pack/);
    assert.equal((await request(`/api/admin/products/${product.slug}`, { method: "DELETE" })).status, 200);
    assert.equal((await request(`/api/admin/products/${product.slug}`, { method: "DELETE" })).status, 200, "archiving is idempotent");
    assert.equal((await (await request("/api/admin/products")).json()).products.find((item) => item.slug === product.slug).status, "archived", "archived records retain their history");
    assert.equal((await request("/api/admin/products", { headers: { Cookie: "dejadon-admin=invalid" } })).status, 401);
    const signedOut = await request("/api/admin/session", { method: "DELETE" });
    assert.equal(signedOut.status, 200);
    assert.match(signedOut.headers.get("set-cookie"), /Max-Age=0/i);
    cookie = undefined;
    assert.equal((await request("/api/admin/products")).status, 401);
  } finally {
    await stop();
    await rm(directory, { recursive: true, force: true });
  }
});
