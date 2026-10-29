const assert = require("node:assert/strict");
const { spawn } = require("node:child_process"); const { randomBytes, createHmac } = require("node:crypto");
const { mkdtemp, rm } = require("node:fs/promises"); const { createServer } = require("node:http");
const os = require("node:os"); const path = require("node:path");

async function startPartnerHarness() {
  const directory = await mkdtemp(path.join(os.tmpdir(), "dejadon-partner-http-"));
  const inbox = new Map(); const transactions = new Map(); const refunds = new Map(); let nextId = 1; let refundPosts = 0;
  const gatewaySecret = `sk_test_${randomBytes(24).toString("hex")}`; const reconcileSecret = randomBytes(32).toString("hex");
  const owner = { email: "super-admin@example.test", password: randomBytes(24).toString("hex") };
  const staff = { email: "ordinary-admin@example.test", password: randomBytes(24).toString("hex") };
  const provider = createServer(async (request, response) => {
    try {
      let raw = ""; for await (const chunk of request) raw += chunk;
      const body = raw ? JSON.parse(raw) : null; const url = new URL(request.url, "http://127.0.0.1");
      const send = (data) => { response.setHeader("Content-Type", "application/json"); response.end(JSON.stringify({ status: true, data })); };
      if (url.pathname === "/resend/emails") { inbox.set(body.to[0], body.text.match(/\b\d{6}\b/)[0]); return send({ id: "test-email" }); }
      assert.equal(request.headers.authorization, `Bearer ${gatewaySecret}`);
      if (url.pathname === "/paystack/transaction/initialize") {
        transactions.set(body.reference, { id: nextId++, reference: body.reference, amount: body.amount, currency: body.currency, customer: { email: body.email }, paid_at: new Date().toISOString(), status: "pending", domain: "test" });
        return send({ reference: body.reference, authorization_url: `https://checkout.paystack.com/${body.reference}` });
      }
      if (url.pathname.startsWith("/paystack/transaction/verify/")) return send(transactions.get(decodeURIComponent(url.pathname.split("/").pop())));
      if (url.pathname === "/paystack/refund" && request.method === "GET") return send([...refunds.values()].filter((item) => String(item.transaction) === url.searchParams.get("transaction")));
      if (url.pathname === "/paystack/refund" && request.method === "POST") {
        refundPosts++; const refund = { id: nextId++, transaction: body.transaction, amount: body.amount, currency: body.currency, status: "pending", merchant_note: body.merchant_note };
        refunds.set(String(refund.id), refund); return send(refund);
      }
      if (url.pathname.startsWith("/paystack/refund/")) return send(refunds.get(url.pathname.split("/").pop()));
      throw new Error(`Unexpected provider path ${url.pathname}`);
    } catch (error) { response.statusCode = 500; response.end(JSON.stringify({ status: false, message: error.message })); }
  });
  await new Promise((resolve) => provider.listen(0, "127.0.0.1", resolve));
  const providerOrigin = `http://127.0.0.1:${provider.address().port}`;
  const reservation = createServer(); await new Promise((resolve) => reservation.listen(0, "127.0.0.1", resolve));
  const port = reservation.address().port; await new Promise((resolve) => reservation.close(resolve));
  const origin = `http://127.0.0.1:${port}`; let server; let output = ""; let address = 0;
  async function start() {
    output = "";
    server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
      env: { ...process.env, DEJADON_DATA_DIR: directory, ADMIN_EMAIL: staff.email, ADMIN_PASSWORD: staff.password, SUPER_ADMIN_EMAIL: owner.email, SUPER_ADMIN_PASSWORD: owner.password,
        RESEND_API_KEY: "re_test_fixture_only", RESEND_FROM: "verification@example.test", PAYSTACK_SECRET_KEY: gatewaySecret, APP_BASE_URL: origin, PARTNER_RECONCILE_SECRET: reconcileSecret,
        DEJADON_TEST_PROVIDER_ORIGIN: providerOrigin, NODE_OPTIONS: `--require "${path.resolve("scripts/partner-provider-preload.cjs").split(path.sep).join("/")}"` },
      stdio: ["ignore", "pipe", "pipe"]
    });
    server.stdout.on("data", (data) => { output += data; }); server.stderr.on("data", (data) => { output += data; });
    for (let attempt = 0; attempt < 80; attempt++) {
      if (server.exitCode !== null) throw new Error(`Server exited: ${output}`);
      try { if ((await fetch(`${origin}/api/partner/session`)).status === 401) return; } catch {}
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    throw new Error(`Server did not start: ${output}`);
  }
  async function stop() { if (server && server.exitCode === null) { const ended = new Promise((resolve) => server.once("exit", resolve)); server.kill(); await ended; } }
  async function close() { await stop(); await new Promise((resolve) => provider.close(resolve)); await rm(directory, { recursive: true, force: true }); }
  function request(route, { body, cookie, headers, ...options } = {}) {
    return fetch(`${origin}${route}`, { ...options, redirect: "manual", headers: { Origin: origin, "X-Forwarded-For": `192.0.2.${++address}`, ...(body !== undefined ? { "Content-Type": "application/json" } : {}), ...(cookie ? { Cookie: cookie } : {}), ...headers }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
  }
  async function json(response, status = 200) { const result = await response.json(); assert.equal(response.status, status, JSON.stringify(result)); return result; }
  function cookie(response) { const value = response.headers.get("set-cookie"); assert.match(value, /HttpOnly/i); assert.match(value, /Secure/i); assert.match(value, /SameSite=Lax/i); return value.split(";")[0]; }
  async function adminSession(who = owner) { const response = await request("/api/admin/session", { method: "POST", body: { ...who, role: "super-admin" } }); await json(response); return cookie(response); }
  async function webhook(event) {
    const raw = JSON.stringify(event); const signature = createHmac("sha512", gatewaySecret).update(raw).digest("hex");
    return fetch(`${origin}/api/paystack/webhook`, { method: "POST", headers: { "Content-Type": "application/json", "x-paystack-signature": signature }, body: raw });
  }
  function pay(reference, overrides = {}) { const transaction = transactions.get(reference); assert.ok(transaction, "known test transaction"); Object.assign(transaction, { status: "success", paid_at: new Date().toISOString(), ...overrides }); }
  try { await start(); } catch (error) { await close(); throw error; }
  return { origin, directory, owner, staff, inbox, transactions, refunds, get refundPosts() { return refundPosts; }, reconcileSecret, request, json, cookie, adminSession, webhook, pay, restart: async () => { await stop(); await start(); }, close, output: () => output };
}
module.exports = { startPartnerHarness };
